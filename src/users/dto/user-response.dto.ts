import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '4dfb1112-9e2f-4b6d-9f9f-2f3fb38b57b7' })
  id: string;

  @ApiProperty({ example: 'ramir' })
  login: string;

  @ApiProperty({ example: 'ramir@example.com' })
  email: string;

  @ApiProperty({ example: 23 })
  age: number;

  @ApiPropertyOptional({
    example: 'I like backend, PostgreSQL and clean architecture.',
    nullable: true,
  })
  about: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  deletedAt: Date | null;

  static fromEntity(user: User): UserResponseDto {
    return Object.assign(new UserResponseDto(), {
      id: user.id,
      login: user.login,
      email: user.email,
      age: user.age,
      about: user.about,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }
}
