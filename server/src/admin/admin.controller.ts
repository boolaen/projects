import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Put('settings/global')
    async updateGlobalSettings(@Body() body: {
        siteName?: string, logoUrl?: string,
        smtpHost?: string, smtpPort?: number, smtpUser?: string, smtpPass?: string, smtpFrom?: string,
        metaTitle?: string, metaDescription?: string, metaKeywords?: string, canonicalUrl?: string,
        robotsTxt?: string, sitemapUrl?: string, ogTitle?: string, ogDescription?: string, ogImage?: string,
        googleAnalyticsId?: string, googleVerification?: string, schemaMarkup?: string
    }) {
        return this.adminService.updateGlobalSettings(body);
    }

    @Get('users')
    async getUsers(
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
        @Query('search') search?: string
    ) {
        return this.adminService.getUsers(page, limit, search);
    }

    @Post('users')
    async addUser(@Body() body: { email: string, username: string, password?: string, role: Role }) {
        return this.adminService.addUser(body);
    }

    @Put('users/:id/role')
    async updateUserRole(@Param('id') id: string, @Body() body: { role: Role }) {
        return this.adminService.updateUserRole(id, body.role);
    }

    @Put('users/:id/ban')
    async banUser(@Param('id') id: string, @Body() body: { isBanned: boolean }) {
        return this.adminService.banUser(id, body.isBanned);
    }

    @Get('videos')
    async getVideos(
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
        @Query('search') search?: string
    ) {
        return this.adminService.getVideos(page, limit, search);
    }

    @Put('videos/:id/feature')
    async featureVideo(@Param('id') id: string, @Body() body: { isFeatured: boolean }) {
        return this.adminService.toggleFeatureVideo(id, body.isFeatured);
    }

    @Put('videos/:id')
    async updateVideo(@Param('id') id: string, @Body() body: { title?: string, description?: string, category?: string, isPremium?: boolean }) {
        return this.adminService.updateVideo(id, body);
    }

    @Delete('videos/:id')
    async deleteVideo(@Param('id') id: string) {
        return this.adminService.deleteVideo(id);
    }

    // ── Subscription Packages ──

    @Get('packages')
    async getPackages() {
        return this.adminService.getPackages();
    }

    @Post('packages')
    async createPackage(@Body() body: any) {
        return this.adminService.createPackage(body);
    }

    @Put('packages/:id')
    async updatePackage(@Param('id') id: string, @Body() body: any) {
        return this.adminService.updatePackage(id, body);
    }

    @Delete('packages/:id')
    async deletePackage(@Param('id') id: string) {
        return this.adminService.deletePackage(id);
    }

    // ── Coupon Code Management ──

    @Post('coupons')
    async createCoupon(@Body() body: { code: string; durationDays: number; maxUses?: number; expiresAt?: string; discountPercent?: number; description?: string }) {
        return this.adminService.createCoupon(body);
    }

    @Get('coupons')
    async getCoupons() {
        return this.adminService.getCoupons();
    }

    @Delete('coupons/:id')
    async deactivateCoupon(@Param('id') id: string) {
        return this.adminService.deactivateCoupon(id);
    }

    // ── Notification Management ──

    @Post('notifications')
    async broadcastNotification(@Body() body: { title: string; message: string; type?: string; link?: string }) {
        return this.adminService.broadcastNotification(body);
    }

    @Get('notifications')
    async getNotifications() {
        return this.adminService.getAdminNotifications();
    }

    // ── Category Management ──

    @Get('categories')
    async getCategories() {
        return this.adminService.getCategories();
    }

    @Post('categories')
    async createCategory(@Body() body: { name: string; slug: string; description?: string; icon?: string; color?: string; order?: number }) {
        return this.adminService.createCategory(body);
    }

    @Put('categories/:id')
    async updateCategory(@Param('id') id: string, @Body() body: { name?: string; slug?: string; description?: string; icon?: string; color?: string; order?: number; isActive?: boolean }) {
        return this.adminService.updateCategory(id, body);
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id') id: string) {
        return this.adminService.deleteCategory(id);
    }
}
