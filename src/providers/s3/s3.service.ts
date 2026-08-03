import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'avatars');
    this.publicUrl = this.configService.get<string>(
      'MINIO_PUBLIC_URL',
      'http://localhost:9000',
    );
    this.client = new S3Client({
      endpoint: this.configService.get<string>(
        'MINIO_ENDPOINT',
        'http://localhost:9000',
      ),
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'MINIO_ACCESS_KEY',
          'minioadmin',
        ),
        secretAccessKey: this.configService.get<string>(
          'MINIO_SECRET_KEY',
          'minioadmin',
        ),
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucket();
  }

  async uploadObject(params: {
    key: string;
    buffer: Buffer;
    contentType: string;
  }): Promise<void> {
    this.logger.log(`Uploading object ${params.key} to bucket ${this.bucketName}`);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    this.logger.warn(`Deleting object ${key} from bucket ${this.bucketName}`);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }

  getPublicUrl(fileName: string): string {
    return `${this.publicUrl.replace(/\/$/, '')}/${this.bucketName}/${fileName}`;
  }

  private async ensureBucket(): Promise<void> {
    try {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
        this.logger.log(`Bucket ${this.bucketName} is ready`);
      } catch {
        this.logger.warn(`Bucket ${this.bucketName} was not found. Creating...`);
        await this.client.send(
          new CreateBucketCommand({
            Bucket: this.bucketName,
          }),
        );
        await this.makeBucketPublic();
        this.logger.log(`Bucket ${this.bucketName} was created`);
      }
    } catch (error) {
      this.logger.warn(
        `S3 bucket initialization skipped: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  private async makeBucketPublic(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        },
      ],
    };

    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(policy),
      }),
    );
  }
}
