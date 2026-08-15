import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import {
  AvatarsRepositoryPort,
  CreateAvatarCommand,
} from './avatars.repository.port';
import { Avatar } from '../entities/avatar.entity';

@Injectable()
export class TypeOrmAvatarsRepository implements AvatarsRepositoryPort {
  constructor(
    @InjectRepository(Avatar)
    private readonly repository: Repository<Avatar>,
  ) {}

  create(command: CreateAvatarCommand): Avatar {
    return this.repository.create(command);
  }

  save(avatar: Avatar): Promise<Avatar> {
    return this.repository.save(avatar);
  }

  countActiveByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        deletedAt: IsNull(),
      },
    });
  }

  findActiveByUserId(userId: string): Promise<Avatar[]> {
    return this.repository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findActiveByIdAndUserId(id: string, userId: string): Promise<Avatar | null> {
    return this.repository.findOne({
      where: {
        id,
        userId,
        deletedAt: IsNull(),
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
