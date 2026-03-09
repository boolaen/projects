import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalUsers, totalVideos, totalViews, totalLikes, totalPremium, totalCoupons] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.video.count(),
            this.prisma.video.aggregate({ _sum: { views: true } }),
            this.prisma.like.count({ where: { isLike: true } }),
            this.prisma.user.count({ where: { role: 'PREMIUM' } }),
            this.prisma.couponCode.count({ where: { isActive: true } }),
        ]);

        return {
            users: totalUsers,
            videos: totalVideos,
            views: totalViews._sum.views || 0,
            likes: totalLikes,
            premiumUsers: totalPremium,
            activeCoupons: totalCoupons,
        };
    }

    // ── Global Site Settings ──

    async getGlobalSettings() {
        return this.prisma.siteSetting.findUnique({ where: { id: 'global' } });
    }

    async updateGlobalSettings(data: {
        siteName?: string, logoUrl?: string,
        smtpHost?: string, smtpPort?: number, smtpUser?: string, smtpPass?: string, smtpFrom?: string,
        metaTitle?: string, metaDescription?: string, metaKeywords?: string, canonicalUrl?: string,
        robotsTxt?: string, sitemapUrl?: string, ogTitle?: string, ogDescription?: string, ogImage?: string,
        googleAnalyticsId?: string, googleVerification?: string, schemaMarkup?: string
    }) {
        let settings = await this.prisma.siteSetting.findUnique({ where: { id: 'global' } });
        if (!settings) {
            settings = await this.prisma.siteSetting.create({ data: { id: 'global', siteName: 'ADUKET' } });
        }
        return this.prisma.siteSetting.update({
            where: { id: 'global' },
            data
        });
    }

    async addUser(data: { email: string; username: string; password?: string; role: Role }) {
        const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existingEmail) throw new HttpException('Bu email adresi zaten kullanılıyor.', HttpStatus.BAD_REQUEST);

        const existingUsername = await this.prisma.user.findUnique({ where: { username: data.username } });
        if (existingUsername) throw new HttpException('Bu kullanıcı adı zaten kullanılıyor.', HttpStatus.BAD_REQUEST);

        if (!data.password || data.password.length < 8) {
            throw new HttpException('Şifre en az 8 karakter olmalıdır.', HttpStatus.BAD_REQUEST);
        }
        const passwordHash = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                role: data.role,
                isVerified: true,
                isEmailVerified: true
            }
        });
    }

    async getUsers(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    isBanned: true,
                    isVerified: true,
                    createdAt: true,
                    _count: { select: { videos: true } }
                }
            }),
            this.prisma.user.count({ where })
        ]);

        return { users, total, page, totalPages: Math.ceil(total / limit) };
    }

    async updateUserRole(id: string, role: Role) {
        return this.prisma.user.update({
            where: { id },
            data: { role }
        });
    }

    async banUser(id: string, isBanned: boolean) {
        return this.prisma.user.update({
            where: { id },
            data: { isBanned }
        });
    }

    async getVideos(page = 1, limit = 10, search?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }

        const [videos, total] = await Promise.all([
            this.prisma.video.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            }),
            this.prisma.video.count({ where })
        ]);

        return { videos, total, page, totalPages: Math.ceil(total / limit) };
    }

    async toggleFeatureVideo(id: string, isFeatured: boolean) {
        return this.prisma.video.update({
            where: { id },
            data: { isFeatured }
        });
    }

    async updateVideo(id: string, data: { title?: string, description?: string, category?: string, isPremium?: boolean }) {
        return this.prisma.video.update({
            where: { id },
            data
        });
    }

    async deleteVideo(id: string) {
        await this.prisma.like.deleteMany({ where: { videoId: id } });
        await this.prisma.comment.deleteMany({ where: { videoId: id } });
        return this.prisma.video.delete({ where: { id } });
    }

    // ── Subscription Packages ──

    async getPackages() {
        return this.prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
    }

    async createPackage(data: any) {
        return this.prisma.subscriptionPlan.create({ data });
    }

    async updatePackage(id: string, data: any) {
        return this.prisma.subscriptionPlan.update({ where: { id }, data });
    }

    async deletePackage(id: string) {
        return this.prisma.subscriptionPlan.delete({ where: { id } });
    }

    // ── Coupon Code Management ──

    async createCoupon(data: { code: string; durationDays: number; maxUses?: number; expiresAt?: string; discountPercent?: number; description?: string }) {
        const existing = await this.prisma.couponCode.findUnique({ where: { code: data.code } });
        if (existing) {
            throw new HttpException('Bu kupon kodu zaten mevcut', HttpStatus.CONFLICT);
        }

        return this.prisma.couponCode.create({
            data: {
                code: data.code.toUpperCase(),
                durationDays: data.durationDays,
                maxUses: data.maxUses || 1,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                discountPercent: data.discountPercent || null,
                description: data.description || null,
            }
        });
    }

    async getCoupons() {
        return this.prisma.couponCode.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async deactivateCoupon(id: string) {
        return this.prisma.couponCode.update({
            where: { id },
            data: { isActive: false }
        });
    }

    // ── Notification Management ──

    async broadcastNotification(data: { title: string; message: string; type?: string; link?: string }) {
        const users = await this.prisma.user.findMany({ select: { id: true } });

        await this.prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title: data.title,
                message: data.message,
                type: data.type || 'info',
            })),
        });

        return { message: `Bildirim ${users.length} kullanıcıya gönderildi`, count: users.length };
    }

    async getAdminNotifications() {
        // Return recent unique notifications (grouped by title+message, most recent first)
        return this.prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            distinct: ['title', 'message'],
            select: {
                id: true,
                title: true,
                message: true,
                type: true,
                createdAt: true,
            },
        });
    }

    // ── Category Management ──

    async getCategories() {
        return this.prisma.category.findMany({ orderBy: { order: 'asc' } });
    }

    async createCategory(data: { name: string; slug: string; description?: string; icon?: string; color?: string; order?: number }) {
        const existing = await this.prisma.category.findUnique({ where: { slug: data.slug } });
        if (existing) throw new HttpException('Bu slug zaten kullanılıyor.', HttpStatus.CONFLICT);
        return this.prisma.category.create({ data });
    }

    async updateCategory(id: string, data: { name?: string; slug?: string; description?: string; icon?: string; color?: string; order?: number; isActive?: boolean }) {
        return this.prisma.category.update({ where: { id }, data });
    }

    async deleteCategory(id: string) {
        return this.prisma.category.delete({ where: { id } });
    }
}
