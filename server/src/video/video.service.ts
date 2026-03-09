
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from './s3.service';
import { Video, VideoStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoService {
    constructor(
        private prisma: PrismaService,
        private s3Service: S3Service,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    private get apiUrl(): string {
        return this.configService.get<string>('API_URL') || 'http://localhost:3001';
    }

    async getStream(key: string, range: string) {
        return this.s3Service.getFileStream(key, range);
    }

    private generateStreamToken(videoId: string): string {
        return this.jwtService.sign({ videoId }, { expiresIn: '5m' });
    }

    async uploadVideo(file: Express.Multer.File, userId: string, metadata: { title: string; description?: string; category?: string; isPremium?: boolean; thumbnailUrl?: string; duration?: number }) {
        const fileKey = `${userId}/${Date.now()}-${file.originalname}`;
        const key = await this.s3Service.uploadFile(file, fileKey);

        // Initial creation
        const video = await this.prisma.video.create({
            data: {
                title: metadata.title,
                description: metadata.description,
                category: metadata.category || 'Uncategorized',
                isPremium: metadata.isPremium || false,
                s3Key: fileKey,
                hlsUrl: '',
                duration: metadata.duration || 0,
                thumbnailUrl: metadata.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
                status: VideoStatus.READY,
                userId: userId,
            },
        });

        // Update to point to proxy URL with token
        const token = this.generateStreamToken(video.id);
        const proxyUrl = `${this.apiUrl}/videos/stream/${video.id}?token=${token}`;
        return this.prisma.video.update({
            where: { id: video.id },
            data: { hlsUrl: proxyUrl },
        });
    }

    async findAll(category?: string, search?: string) {
        let where: any = {};

        if (category && category !== 'All') {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const videos = await this.prisma.video.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        });

        // Map videos to point to proxy URL with fresh token
        return videos.map(video => {
            const token = this.generateStreamToken(video.id);
            return {
                ...video,
                hlsUrl: `${this.apiUrl}/videos/stream/${video.id}?token=${token}`
            };
        });
    }

    async findOne(id: string) {
        const video = await this.prisma.video.findUnique({
            where: { id },
            include: { user: { select: { username: true } } }
        });

        if (video) {
            const token = this.generateStreamToken(video.id);
            video.hlsUrl = `${this.apiUrl}/videos/stream/${video.id}?token=${token}`;
        }

        return video;
    }

    async findAllByUser(userId: string) {
        const videos = await this.prisma.video.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        });

        return videos.map(video => {
            const token = this.generateStreamToken(video.id);
            return {
                ...video,
                hlsUrl: `${this.apiUrl}/videos/stream/${video.id}?token=${token}`
            };
        });
    }

    async findTrending() {
        return this.prisma.video.findMany({
            where: { status: 'READY' },
            orderBy: [
                { views: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 20,
            include: { user: { select: { username: true } } }
        });
    }
    async searchByTitle(query: string) {
        if (!query || query.trim().length < 2) return [];
        return this.prisma.video.findMany({
            where: {
                status: 'READY',
                title: { contains: query.trim(), mode: 'insensitive' },
            },
            orderBy: { views: 'desc' },
            take: 5,
            select: { id: true, title: true, thumbnailUrl: true, views: true, isPremium: true },
        });
    }

    async getActiveCategories() {
        return this.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: { id: true, name: true, slug: true, description: true, icon: true, color: true },
        });
    }

}
