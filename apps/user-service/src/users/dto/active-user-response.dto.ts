import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ActiveUserProjection } from '../repositories/users.repository.port';

export class LatestAvatarResponseDto {
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
}

export class ActiveUserResponseDto {
  @ApiProperty({ example: '4dfb1112-9e2f-4b6d-9f9f-2f3fb38b57b7' })
  id: string;

  @ApiProperty({ example: 'ramir' })
  login: string;

  @ApiProperty({ example: 'ramir@example.com' })
  email: string;

  @ApiProperty({ example: 23 })
  age: number;

  @ApiProperty({ example: '20.51' })
  balance: string;

  @ApiPropertyOptional({
    example: 'I like backend, PostgreSQL and clean architecture.',
    nullable: true,
  })
  about: string | null;

  @ApiProperty({ example: 3 })
  activeAvatarsCount: number;

  @ApiPropertyOptional({ type: LatestAvatarResponseDto, nullable: true })
  latestAvatar: LatestAvatarResponseDto | null;

  static fromProjection(
    user: ActiveUserProjection,
    avatarUrl: string | null,
  ): ActiveUserResponseDto {
    const dto = new ActiveUserResponseDto();
    dto.id = user.id;
    dto.login = user.login;
    dto.email = user.email;
    dto.age = user.age;
    dto.about = user.about;
    dto.balance = user.balance;
    dto.activeAvatarsCount = user.activeAvatarsCount;
    dto.latestAvatar =
      user.latestAvatar && avatarUrl
        ? {
            id: user.latestAvatar.id,
            fileName: user.latestAvatar.fileName,
            originalName: user.latestAvatar.originalName,
            mimeType: user.latestAvatar.mimeType,
            size: user.latestAvatar.size,
            createdAt: user.latestAvatar.createdAt,
            url: avatarUrl,
          }
        : null;

    return dto;
  }
}
