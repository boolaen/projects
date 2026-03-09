
import { Controller, Post, UseInterceptors, UploadedFile, Body, Request, UseGuards, Get, Query, Param, Res, Headers, HttpStatus, HttpException, BadRequestException, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';

const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

@Controller('videos')
export class VideoController {
    private readonly logger = new Logger(VideoController.name);

    constructor(
        private readonly videoService: VideoService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 2 * 1024 * 1024 * 1024, // 2 GB max
        }
    }))
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { title: string; description?: string; category?: string; isPremium?: string; thumbnailUrl?: string; duration?: string },
        @Request() req
    ) {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'CREATOR') {
            throw new HttpException('Forbidden: Only Admins and Creators can upload videos', HttpStatus.FORBIDDEN);
        }

        // MIME type validation
        if (!file || !ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
            throw new BadRequestException('Geçersiz dosya türü. Sadece web uyumlu video/görüntü dosyaları yüklenebilir (MP4, WebM, OGG, MOV). AVI veya MKV formatları tarayıcıda doğrudan desteklenmez, lütfen MP4 olarak dönüştürüp yükleyiniz.');
        }

        const isPremium = body.isPremium === 'true';
        const duration = body.duration ? parseInt(body.duration, 10) : undefined;
        try {
            return await this.videoService.uploadVideo(file, req.user.userId, { ...body, isPremium, duration });
        } catch (error) {
            this.logger.error('Upload error in controller:', error.message);
            throw error;
        }
    }

    @Get('categories')
    async getPublicCategories() {
        return this.videoService.getActiveCategories();
    }

    @Get()
    async getVideos(
        @Query('category') category: string,
        @Query('search') search: string
    ) {
        return this.videoService.findAll(category, search);
    }

    @Get('trending')
    async getTrendingVideos() {
        return this.videoService.findTrending();
    }

    @Get('search')
    async searchVideos(@Query('q') q: string) {
        return this.videoService.searchByTitle(q);
    }

    @Get('user/:userId')
    async getUserVideos(@Param('userId') userId: string) {
        return this.videoService.findAllByUser(userId);
    }

    @Get(':id/preview')
    async getPreviewToken(@Param('id') id: string) {
        const video = await this.videoService.findOne(id);
        if (!video) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

        const token = this.jwtService.sign({
            videoId: id,
            isPreview: true
        }, { expiresIn: '5m' });

        return { token };
    }

    @Get(':id')
    async getVideo(@Param('id') id: string) {
        return this.videoService.findOne(id);
    }

    @Get('stream/:id')
    async streamVideo(
        @Param('id') id: string,
        @Headers('range') range: string,
        @Headers('referer') referer: string,
        @Query('token') token: string,
        @Res() res: Response
    ) {
        let canWatch = false;

        // 1. Verify Token if present
        if (token) {
            try {
                const payload = this.jwtService.verify(token);
                if (payload.videoId === id) {
                    canWatch = true;
                }
            } catch (e) {
                // Token invalid/expired — fall through to public access check
            }
        }

        // 2. Look up video
        const video = await this.videoService.findOne(id);
        if (!video || !video.s3Key) {
            res.status(HttpStatus.NOT_FOUND).json({ message: 'Video not found' });
            return;
        }

        // 3. If not authorized by token, check if video is public
        if (!canWatch) {
            if (video.isPremium) {
                res.status(HttpStatus.FORBIDDEN).json({ message: 'Forbidden: Premium Subscription Required' });
                return;
            }
            canWatch = true;
        }

        // 4. Stream video from S3/MinIO with security headers
        try {
            const s3Response = await this.videoService.getStream(video.s3Key, range);

            if (s3Response.ContentType) {
                res.setHeader('Content-Type', s3Response.ContentType);
            }
            if (s3Response.ContentLength !== undefined) {
                res.setHeader('Content-Length', s3Response.ContentLength.toString());
            }
            res.setHeader('Accept-Ranges', 'bytes');

            // Anti-download / anti-cache headers
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('X-Content-Type-Options', 'nosniff');

            if (range && s3Response.ContentRange) {
                res.status(HttpStatus.PARTIAL_CONTENT);
                res.setHeader('Content-Range', s3Response.ContentRange);
            } else {
                res.status(HttpStatus.OK);
            }

            // Read stream into buffer and send response
            const bodyStream = s3Response.Body;
            if (bodyStream && typeof (bodyStream as any).pipe === 'function') {
                (bodyStream as any).pipe(res);
            } else if (bodyStream && typeof (bodyStream as any).transformToByteArray === 'function') {
                const bytes = await (bodyStream as any).transformToByteArray();
                res.end(Buffer.from(bytes));
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Cannot read video stream' });
            }
        } catch (error) {
            this.logger.error(`Streaming error: ${error.message}`);
            if (!res.headersSent) {
                if (error.Code === 'NoSuchKey' || error.name === 'NoSuchKey') {
                    res.status(HttpStatus.NOT_FOUND).json({ message: 'Video file not found in storage' });
                } else {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error streaming video' });
                }
            }
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/access')
    async getVideoAccess(@Param('id') id: string, @Request() req) {
        const video = await this.videoService.findOne(id);
        if (!video) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

        const user = req.user;

        if (user.isBanned) {
            throw new HttpException('User is banned', HttpStatus.FORBIDDEN);
        }

        if (video.isPremium && user.role !== 'PREMIUM' && user.role !== 'ADMIN' && user.role !== 'CREATOR') {
            throw new HttpException('Premium subscription required', HttpStatus.FORBIDDEN);
        }

        const token = this.jwtService.sign({
            videoId: id,
            userId: user.userId,
            canWatchPremium: true
        }, { expiresIn: '1h' });

        const apiUrl = this.configService.get<string>('API_URL') || 'http://localhost:3001';

        return {
            accessToken: token,
            playbackUrl: `${apiUrl}/videos/stream/${id}?token=${token}`
        };
    }
}
