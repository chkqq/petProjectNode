import { ApiProperty } from '@nestjs/swagger';

import { Avatar } from '../entities/avatar.entity';

export class AvatarResponseDto {
  @ApiProperty({ example: '9d979b16-bb44-4454-9b8f-6885cf158222' })
  id: string;

  @ApiProperty({ example: 'avatars/user-id/uuid.png' })
  fileName: string;

  @ApiProperty({ example: 'avatar.png' })
  originalName: string;

  @ApiProperty({ example: 'image/png' })
  mimeType: string;

  @ApiProperty({ example: 204800 })
  size: number;

  @ApiProperty({ example: 'http://localhost:9000/avatars/avatars/user-id/uuid.png' })
  url: string;

  @ApiProperty({ example: '2026-07-22T10:00:00.000Z' })
  createdAt: Date;

  static fromEntity(avatar: Avatar, url: string): AvatarResponseDto {
    const dto = new AvatarResponseDto();
    dto.id = avatar.id;
    dto.fileName = avatar.fileName;
    dto.originalName = avatar.originalName;
    dto.mimeType = avatar.mimeType;
    dto.size = avatar.size;
    dto.url = url;
    dto.createdAt = avatar.createdAt;
    return dto;
  }
}
