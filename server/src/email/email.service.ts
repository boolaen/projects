import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private prisma: PrismaService) { }

  private async getTransporter() {
    const settings = await this.prisma.siteSetting.findUnique({ where: { id: 'global' } });

    const host = settings?.smtpHost || process.env.SMTP_HOST;
    const port = settings?.smtpPort || parseInt(process.env.SMTP_PORT || '465', 10);
    const user = settings?.smtpUser || process.env.SMTP_USER;
    const pass = settings?.smtpPass || process.env.SMTP_PASS;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const transporter = await this.getTransporter();
      const settings = await this.prisma.siteSetting.findUnique({ where: { id: 'global' } });
      const from = settings?.smtpFrom || process.env.SMTP_FROM || '"Aduket" <noreply@aduket.com>';

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}`, error);
      return false;
    }
  }

  // Preset templates for easy usage
  async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = 'Şifre Sıfırlama Talebi - Aduket';
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #0A0A0B; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <h2 style="color: #FF007F; margin-bottom: 24px; font-weight: 900; letter-spacing: -0.5px;">Şifrenizi Sıfırlayın</h2>
        <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">Merhaba,</p>
        <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">Hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi yenilemek için aşağıdaki butona tıklayın:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #FF007F 0%, #7928CA 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block;">Şifremi Sıfırla</a>
        </div>
        
        <p style="color: #888888; font-size: 14px; margin-top: 32px; border-top: 1px solid #222; padding-top: 24px;">Bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
        <p style="color: #666666; font-size: 12px; margin-top: 16px;">© ${new Date().getFullYear()} Aduket. Tüm hakları saklıdır.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendVerificationEmail(to: string, verifyLink: string) {
    const subject = 'E-posta Adresinizi Doğrulayın - Aduket';
    const html = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #0A0A0B; color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #333;">
        <h2 style="color: #FF007F; margin-bottom: 24px; font-weight: 900; letter-spacing: -0.5px;">Aduket'e Hoş Geldiniz</h2>
        <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">Aramıza katıldığınız için teşekkür ederiz!</p>
        <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">Hesabınızı başarıyla oluşturduk. İşlemleri tamamlamak ve hesabınızı aktifleştirmek için lütfen e-posta adresinizi doğrulayın:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyLink}" style="background: linear-gradient(135deg, #FFD700 0%, #FF8C00 100%); color: #000; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">E-postamı Doğrula</a>
        </div>
        
        <p style="color: #888888; font-size: 14px; margin-top: 32px; border-top: 1px solid #222; padding-top: 24px;">Doğrulama işlemini tamamlamadan bazı premium özelliklere erişemeyebilirsiniz.</p>
        <p style="color: #666666; font-size: 12px; margin-top: 16px;">© ${new Date().getFullYear()} Aduket. Tüm hakları saklıdır.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
