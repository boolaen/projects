
import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException, Query, BadRequestException, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 login attempts per minute
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: any) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Hatalı e-posta veya şifre');
        }
        const { access_token, user: userData } = await this.authService.login(user);

        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', access_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

        return { user: userData, message: 'Başarıyla giriş yapıldı' };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: any) {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
        });
        return { message: 'Çıkış yapıldı' };
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 register attempts per minute
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        if (!token) throw new BadRequestException('Token gerekli');
        const success = await this.usersService.verifyEmail(token);
        if (!success) throw new BadRequestException('Geçersiz veya süresi dolmuş token');
        return { message: 'E-posta başarıyla doğrulandı' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('resend-verification')
    async resendVerification(@Request() req: any) {
        if (!req.user || !req.user.email) throw new BadRequestException('Kullanıcı bulunamadı');
        const success = await this.usersService.resendVerificationEmail(req.user.email);
        if (!success) throw new BadRequestException('E-posta gönderilemedi veya zaten doğrulanmış.');
        return { message: 'Doğrulama e-postası yeniden gönderildi. Lütfen gelen kutunuzu kontrol edin.' };
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('request-password-reset')
    async requestPasswordReset(@Body('email') email: string) {
        if (!email) throw new BadRequestException('E-posta gerekli');
        // Always return success to prevent email enumeration
        await this.usersService.requestPasswordReset(email);
        return { message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilmiştir.' };
    }

    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        const success = await this.usersService.resetPassword(body.token, body.newPassword);
        if (!success) throw new BadRequestException('Geçersiz veya süresi dolmuş token');

        return { message: 'Şifreniz başarıyla yenilendi' };
    }
}
