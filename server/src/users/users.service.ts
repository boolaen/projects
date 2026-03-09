import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private configService: ConfigService,
    ) { }

    private get frontendUrl(): string {
        return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    }

    async create(data: any): Promise<User> {
        const { email, username, password: plainPassword } = data;

        // Remove 'password' field if it exists to avoid Prisma error
        // Actually, we construct the data object explicitly.

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(plainPassword, salt);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                emailVerificationToken: verificationToken,
                role: 'FREE', // enforcing default role just in case
            },
        });

        // Send verification email
        // In production, this URL should be your frontend domain
        const verifyLink = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
        await this.emailService.sendVerificationEmail(user.email, verifyLink);

        return user;
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                subscriptions: {
                    where: { status: 'active' },
                    orderBy: { currentPeriodEnd: 'desc' },
                    take: 1
                }
            }
        });
    }
    async getProfile(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username },
            include: {
                _count: {
                    select: { videos: true, comments: true, likes: true }
                }
            }
        });
    }

    async updateProfile(userId: string, data: { username?: string; email?: string; avatarUrl?: string; bio?: string }) {
        // Check for email uniqueness if email is being changed
        if (data.email) {
            const existing = await this.prisma.user.findFirst({
                where: { email: data.email, NOT: { id: userId } }
            });
            if (existing) {
                throw new Error('Bu e-posta adresi zaten kullanılıyor');
            }
        }

        // Check for username uniqueness if username is being changed
        if (data.username) {
            const existing = await this.prisma.user.findFirst({
                where: { username: data.username, NOT: { id: userId } }
            });
            if (existing) {
                throw new Error('Bu kullanıcı adı zaten kullanılıyor');
            }
        }

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.username && { username: data.username }),
                ...(data.email && { email: data.email }),
                ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
                ...(data.bio !== undefined && { bio: data.bio }),
            }
        });
    }

    async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return false;

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) return false;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
        return true;
    }

    async resendVerificationEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || user.isVerified) return false;

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerificationToken: verificationToken },
        });

        // Send verification email
        const verifyLink = `${this.frontendUrl}/verify-email?token=${verificationToken}`;
        await this.emailService.sendVerificationEmail(user.email, verifyLink);

        return true;
    }

    async verifyEmail(token: string): Promise<boolean> {
        const user = await this.prisma.user.findFirst({
            where: { emailVerificationToken: token },
        });

        if (!user) return false;

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                isEmailVerified: true,
                emailVerificationToken: null,
            },
        });

        return true;
    }

    async requestPasswordReset(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return false; // Don't throw to prevent email enumeration

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: expires,
            },
        });

        // Send reset email
        const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;
        await this.emailService.sendPasswordResetEmail(user.email, resetLink);

        return true;
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date(), // Check if not expired
                },
            },
        });

        if (!user) return false;

        if (!newPassword || newPassword.length < 8) {
            return false; // Password too short
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        return true;
    }

    async deleteUser(userId: string) {
        // Manually delete related records first due to lack of cascade
        // This is a naive implementation and might miss some relations if schema grows
        await this.prisma.like.deleteMany({ where: { userId } });
        await this.prisma.comment.deleteMany({ where: { userId } });
        await this.prisma.subscription.deleteMany({ where: { userId } });
        await this.prisma.complianceLog.deleteMany({ where: { userId } });

        // Videos are tricky because they have likes/comments too
        // For now, let's try to delete user and if it fails, it fails.
        // Or better: delete videos first
        const userVideos = await this.prisma.video.findMany({ where: { userId } });
        for (const video of userVideos) {
            await this.prisma.like.deleteMany({ where: { videoId: video.id } });
            await this.prisma.comment.deleteMany({ where: { videoId: video.id } });
            await this.prisma.video.delete({ where: { id: video.id } });
        }

        return this.prisma.user.delete({ where: { id: userId } });
    }
}
