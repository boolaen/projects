
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand, GetObjectCommand, DeleteBucketPolicyCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service implements OnModuleInit {
    private s3Client: S3Client;
    private bucketName: string;
    private logger = new Logger(S3Service.name);

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET');
        this.s3Client = new S3Client({
            region: this.configService.getOrThrow<string>('S3_REGION'),
            endpoint: this.configService.getOrThrow<string>('S3_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('S3_ACCESS_KEY'),
                secretAccessKey: this.configService.getOrThrow<string>('S3_SECRET_KEY'),
            },
            forcePathStyle: true, // Required for MinIO
        });
    }

    async onModuleInit() {
        await this.ensureBucketExists();
        await this.deleteBucketPolicy(); // Ensure no public policy exists
    }

    private async deleteBucketPolicy() {
        try {
            await this.s3Client.send(new DeleteBucketPolicyCommand({ Bucket: this.bucketName }));
            this.logger.log(`Bucket policy deleted for '${this.bucketName}' (Private Access Only).`);
        } catch (error) {
            // Ignore if policy doesn't exist
            if (error.name !== 'NoSuchBucketPolicy') {
                this.logger.error(`Failed to delete bucket policy: ${error.message}`);
            }
        }
    }

    private async ensureBucketExists() {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
            this.logger.log(`Bucket '${this.bucketName}' exists.`);
        } catch (error) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                this.logger.log(`Bucket '${this.bucketName}' not found. Creating...`);
                try {
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
                    this.logger.log(`Bucket '${this.bucketName}' created successfully.`);
                } catch (createError) {
                    this.logger.error(`Failed to create bucket: ${createError.message}`);
                }
            } else {
                this.logger.error(`Error checking bucket existence: ${error.message}`);
            }
        }
    }

    async uploadFile(file: Express.Multer.File, key: string) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // REMOVED for security
        });

        try {
            await this.s3Client.send(command);
            // Return only the key, not the public URL
            return key;
        } catch (error) {
            this.logger.error(`Upload failed: ${error.message}`);
            throw error;
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        // Generate pre-signed URL
        // expires in seconds (default 1 hour)
        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async getFileStream(key: string, range?: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Range: range,
        });

        try {
            return await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Failed to get file stream: ${error.message}`);
            throw error;
        }
    }
}
