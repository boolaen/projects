import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InteractionService {
    constructor(private prisma: PrismaService) { }

    async toggleLike(userId: string, videoId: string, isLike: boolean) {
        const existingLike = await this.prisma.like.findUnique({
            where: {
                userId_videoId: { userId, videoId }
            }
        });

        if (existingLike) {
            if (existingLike.isLike === isLike) {
                // Toggle OFF (remove like/dislike)
                await this.prisma.like.delete({
                    where: { id: existingLike.id }
                });
                return { status: 'removed' };
            } else {
                // Switch (Like -> Dislike or vice versa)
                const updated = await this.prisma.like.update({
                    where: { id: existingLike.id },
                    data: { isLike }
                });
                return { status: 'updated', isLike: updated.isLike };
            }
        }

        // Create new
        const newLike = await this.prisma.like.create({
            data: {
                userId,
                videoId,
                isLike
            }
        });
        return { status: 'created', isLike: newLike.isLike };
    }

    async addComment(userId: string, videoId: string, text: string) {
        return this.prisma.comment.create({
            data: {
                userId,
                videoId,
                text
            },
            include: { user: { select: { username: true } } }
        });
    }

    async getComments(videoId: string) {
        return this.prisma.comment.findMany({
            where: { videoId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true } } }
        });
    }

    async incrementView(videoId: string) {
        return this.prisma.video.update({
            where: { id: videoId },
            data: { views: { increment: 1 } }
        });
    }

    async getStats(videoId: string) {
        const likes = await this.prisma.like.count({ where: { videoId, isLike: true } });
        const dislikes = await this.prisma.like.count({ where: { videoId, isLike: false } });
        // Views are in the video object, but we can return them here if needed
        return { likes, dislikes };
    }
}
