
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { S3Service } from './s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        AuthModule,
    ],
    controllers: [VideoController, InteractionController],
    providers: [VideoService, S3Service, PrismaService, InteractionService],
})
export class VideoModule { }
