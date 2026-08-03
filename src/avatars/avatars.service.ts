import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Transactional } from 'typeorm-transactional';

import { AvatarResponseDto } from './dto/avatar-response.dto';
import { Avatar } from './entities/avatar.entity';
import {
  AVATARS_REPOSITORY,
  AvatarsRepositoryPort,
} from './repositories/avatars.repository.port';
import { S3Service } from '../providers/s3/s3.service';
import { UsersService } from '../users/users.service';

const MAX_ACTIVE_AVATARS = 5;

@Injectable()
export class AvatarsService {
  private readonly logger = new Logger(AvatarsService.name);

  constructor(
    @Inject(AVATARS_REPOSITORY)
    private readonly avatarsRepository: AvatarsRepositoryPort,
    private readonly s3Service: S3Service,
    private readonly usersService: UsersService,
  ) {}

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    this.logger.log(`Uploading avatar for user ${userId}`);
    const fileName = this.buildFileName(userId, file);
    let isUploadedToStorage = false;

    try {
      await this.s3Service.uploadObject({
        key: fileName,
        buffer: file.buffer,
        contentType: file.mimetype,
      });
      isUploadedToStorage = true;

      const savedAvatar = await this.saveAvatarMetadataWithLimit(
        userId,
        file,
        fileName,
      );
      this.logger.log(`Avatar ${savedAvatar.id} uploaded for user ${userId}`);

      return AvatarResponseDto.fromEntity(
        savedAvatar,
        this.s3Service.getPublicUrl(savedAvatar.fileName),
      );
    } catch (error) {
      if (isUploadedToStorage) {
        await this.deleteUploadedObjectAfterFailure(fileName);
      }

      throw error;
    }
  }

  @Transactional()
  async saveAvatarMetadataWithLimit(
    userId: string,
    file: Express.Multer.File,
    fileName: string,
  ): Promise<Avatar> {
    await this.usersService.lockByIdOrFailForUpdate(userId);
    const activeCount = await this.avatarsRepository.countActiveByUserId(userId);

    if (activeCount >= MAX_ACTIVE_AVATARS) {
      throw new BadRequestException('User can have only 5 active avatars');
    }

    const avatar = this.avatarsRepository.create({
      userId,
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    return this.avatarsRepository.save(avatar);
  }

  async findMyAvatars(userId: string): Promise<AvatarResponseDto[]> {
    this.logger.log(`Loading active avatars for user ${userId}`);
    const avatars = await this.avatarsRepository.findActiveByUserId(userId);
    return avatars.map((avatar) =>
      AvatarResponseDto.fromEntity(
        avatar,
        this.s3Service.getPublicUrl(avatar.fileName),
      ),
    );
  }

  async deleteAvatar(userId: string, avatarId: string): Promise<void> {
    this.logger.log(`Deleting avatar ${avatarId} for user ${userId}`);
    const avatar = await this.avatarsRepository.findActiveByIdAndUserId(
      avatarId,
      userId,
    );

    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }

    await this.avatarsRepository.softDelete(avatar.id);
    this.logger.log(`Avatar ${avatarId} was soft deleted`);
  }

  private buildFileName(userId: string, file: Express.Multer.File): string {
    const extension = extname(file.originalname).toLowerCase();
    const safeExtension =
      extension === '.jpg' || extension === '.jpeg' || extension === '.png'
        ? extension
        : file.mimetype === 'image/png'
          ? '.png'
          : '.jpg';

    return `avatars/${userId}/${randomUUID()}${safeExtension}`;
  }

  private async deleteUploadedObjectAfterFailure(fileName: string): Promise<void> {
    try {
      await this.s3Service.deleteObject(fileName);
      this.logger.warn(`Orphan avatar object ${fileName} was deleted`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete orphan avatar object ${fileName}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
