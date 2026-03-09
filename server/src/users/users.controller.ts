import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('settings/global')
    async getGlobalSettings() {
        let settings = await this.prisma.siteSetting.findUnique({ where: { id: 'global' } });
        if (!settings) {
            settings = await this.prisma.siteSetting.create({ data: { id: 'global', siteName: 'ADUKET' } });
        }
        return settings;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getMe(@Request() req) {
        return this.usersService.findOneById(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('me')
    async updateMe(@Request() req, @Body() body: { username?: string, email?: string, avatarUrl?: string, bio?: string }) {
        return this.usersService.updateProfile(req.user.userId, body);
    }

    @Put('password')
    @UseGuards(AuthGuard('jwt'))
    async updatePassword(@Request() req, @Body() body: { current: string, new: string }) {
        const success = await this.usersService.updatePassword(req.user.userId, body.current, body.new);
        if (!success) {
            throw new NotFoundException('Password update failed. Check current password.');
        }
        return { message: 'Password updated successfully' };
    }

    @Delete('me')
    @UseGuards(AuthGuard('jwt'))
    async deleteMe(@Request() req) {
        await this.usersService.deleteUser(req.user.userId);
        return { message: 'User deleted successfully' };
    }

    @Get('profile/:username')
    async getProfile(@Param('username') username: string) {
        const user = await this.usersService.getProfile(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const { passwordHash, ...result } = user;
        return result;
    }

    // ── Coupon Redemption ──

    @Post('redeem-coupon')
    @UseGuards(AuthGuard('jwt'))
    async redeemCoupon(@Request() req, @Body() body: { code: string }) {
        const code = body.code?.trim().toUpperCase();
        if (!code) {
            throw new HttpException('Kupon kodu gerekli', HttpStatus.BAD_REQUEST);
        }

        const coupon = await this.prisma.couponCode.findUnique({ where: { code } });
        if (!coupon || !coupon.isActive) {
            throw new HttpException('Geçersiz veya kullanılmış kupon kodu', HttpStatus.NOT_FOUND);
        }

        if (coupon.currentUses >= coupon.maxUses) {
            throw new HttpException('Bu kupon kodu kullanım limitine ulaşmış', HttpStatus.GONE);
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            throw new HttpException('Bu kupon kodunun süresi dolmuş', HttpStatus.GONE);
        }

        // Upgrade user to PREMIUM
        await this.prisma.user.update({
            where: { id: req.user.userId },
            data: { role: 'PREMIUM' }
        });

        // Handle Subscription Record
        const activeSub = await this.prisma.subscription.findFirst({
            where: { userId: req.user.userId, status: 'active' },
            orderBy: { currentPeriodEnd: 'desc' }
        });

        let newEndDate = new Date();
        if (activeSub && activeSub.currentPeriodEnd > new Date()) {
            newEndDate = new Date(activeSub.currentPeriodEnd);
        }
        newEndDate.setDate(newEndDate.getDate() + coupon.durationDays);

        if (activeSub) {
            await this.prisma.subscription.update({
                where: { id: activeSub.id },
                data: { currentPeriodEnd: newEndDate }
            });
        } else {
            await this.prisma.subscription.create({
                data: {
                    userId: req.user.userId,
                    stripeSubId: `coupon_${coupon.code}_${Date.now()}`,
                    status: 'active',
                    currentPeriodEnd: newEndDate
                }
            });
        }

        // Increment coupon usage
        await this.prisma.couponCode.update({
            where: { id: coupon.id },
            data: { currentUses: coupon.currentUses + 1 }
        });

        // Create notification
        await this.prisma.notification.create({
            data: {
                userId: req.user.userId,
                title: 'Premium Aktif! 🎉',
                message: `Tebrikler! ${coupon.durationDays} günlük premium üyeliğiniz aktif edildi.`,
                type: 'premium',
            }
        });

        return { message: 'Kupon başarıyla kullanıldı! Premium üyeliğiniz aktif.', durationDays: coupon.durationDays };
    }

    // ── Notifications ──

    @Get('notifications')
    @UseGuards(AuthGuard('jwt'))
    async getNotifications(@Request() req) {
        return this.prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    @Put('notifications/:id/read')
    @UseGuards(AuthGuard('jwt'))
    async markAsRead(@Request() req, @Param('id') id: string) {
        return this.prisma.notification.update({
            where: { id, userId: req.user.userId },
            data: { isRead: true },
        });
    }

    @Put('notifications/read-all')
    @UseGuards(AuthGuard('jwt'))
    async markAllAsRead(@Request() req) {
        await this.prisma.notification.updateMany({
            where: { userId: req.user.userId, isRead: false },
            data: { isRead: true },
        });
        return { message: 'All notifications marked as read' };
    }
}
