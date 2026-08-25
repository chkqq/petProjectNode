import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import {
  ActiveUserProjection,
  CreateUserCommand,
  FindActiveUsersParams,
  FindAllUsersParams,
  LatestAvatarProjection,
  PaginatedUsers,
  UpdateUserCommand,
  UsersRepositoryPort,
} from './users.repository.port';
import { Avatar } from '../../avatars/entities/avatar.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TypeOrmUsersRepository implements UsersRepositoryPort {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(command: CreateUserCommand): User {
    return this.repository.create({
      ...command,
      about: command.about ?? null,
      balance: '0.00',
      refreshTokenHash: null,
      refreshTokenVersion: 0,
    });
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByIdWithSecrets(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash', 'user.refreshTokenHash'])
      .where('user.id = :id', { id })
      .getOne();
  }

  findByLogin(login: string): Promise<User | null> {
    return this.repository.findOne({ where: { login } });
  }

  findByLoginWithPassword(login: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect(['user.passwordHash'])
      .where('user.login = :login', { login })
      .getOne();
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findAll(params: FindAllUsersParams): Promise<PaginatedUsers> {
    const { page, limit, login } = params;
    const where = login ? { login: ILike(`%${login}%`) } : {};

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findActiveUsers(
    params: FindActiveUsersParams,
  ): Promise<ActiveUserProjection[]> {
    const rows = await this.repository
      .createQueryBuilder('user')
      .leftJoin(
        Avatar,
        'avatar',
        'avatar.user_id = user.id AND avatar.deleted_at IS NULL',
      )
      .select('user.id', 'id')
      .addSelect('user.login', 'login')
      .addSelect('user.email', 'email')
      .addSelect('user.age', 'age')
      .addSelect('user.about', 'about')
      .addSelect('user.balance', 'balance')
      .addSelect('user.created_at', 'createdAt')
      .addSelect('user.updated_at', 'updatedAt')
      .addSelect('user.deleted_at', 'deletedAt')
      .addSelect('COUNT(avatar.id)::int', 'activeAvatarsCount')
      .addSelect((subQuery) => {
        return subQuery
          .select('latest_avatar.id')
          .from(Avatar, 'latest_avatar')
          .where('latest_avatar.user_id = user.id')
          .andWhere('latest_avatar.deleted_at IS NULL')
          .orderBy('latest_avatar.created_at', 'DESC')
          .limit(1);
      }, 'latestAvatarId')
      .addSelect((subQuery) => {
        return subQuery
          .select('latest_avatar.file_name')
          .from(Avatar, 'latest_avatar')
          .where('latest_avatar.user_id = user.id')
          .andWhere('latest_avatar.deleted_at IS NULL')
          .orderBy('latest_avatar.created_at', 'DESC')
          .limit(1);
      }, 'latestAvatarFileName')
      .addSelect((subQuery) => {
        return subQuery
          .select('latest_avatar.original_name')
          .from(Avatar, 'latest_avatar')
          .where('latest_avatar.user_id = user.id')
          .andWhere('latest_avatar.deleted_at IS NULL')
          .orderBy('latest_avatar.created_at', 'DESC')
          .limit(1);
      }, 'latestAvatarOriginalName')
      .addSelect((subQuery) => {
        return subQuery
          .select('latest_avatar.mime_type')
          .from(Avatar, 'latest_avatar')
          .where('latest_avatar.user_id = user.id')
          .andWhere('latest_avatar.deleted_at IS NULL')
          .orderBy('latest_avatar.created_at', 'DESC')
          .limit(1);
      }, 'latestAvatarMimeType')
      .addSelect((subQuery) => {
        return subQuery
          .select('latest_avatar.size')
          .from(Avatar, 'latest_avatar')
          .where('latest_avatar.user_id = user.id')
          .andWhere('latest_avatar.deleted_at IS NULL')
          .orderBy('latest_avatar.created_at', 'DESC')
          .limit(1);
      }, 'latestAvatarSize')
      .addSelect((subQuery) => {
        return subQuery
          .select('latest_avatar.created_at')
          .from(Avatar, 'latest_avatar')
          .where('latest_avatar.user_id = user.id')
          .andWhere('latest_avatar.deleted_at IS NULL')
          .orderBy('latest_avatar.created_at', 'DESC')
          .limit(1);
      }, 'latestAvatarCreatedAt')
      .where('user.deleted_at IS NULL')
      .andWhere('user.about IS NOT NULL')
      .andWhere("btrim(user.about) <> ''")
      .andWhere('user.age BETWEEN :minAge AND :maxAge', params)
      .groupBy('user.id')
      .having('COUNT(avatar.id) > 2')
      .orderBy('COUNT(avatar.id)', 'DESC')
      .addOrderBy('user.created_at', 'DESC')
      .getRawMany<{
        id: string;
        login: string;
        email: string;
        age: number;
        about: string | null;
        balance: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        activeAvatarsCount: number;
        latestAvatarId: string | null;
        latestAvatarFileName: string | null;
        latestAvatarOriginalName: string | null;
        latestAvatarMimeType: string | null;
        latestAvatarSize: number | null;
        latestAvatarCreatedAt: Date | null;
      }>();

    return rows.map((row) => ({
      id: row.id,
      login: row.login,
      email: row.email,
      age: Number(row.age),
      about: row.about,
      balance: row.balance,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      activeAvatarsCount: Number(row.activeAvatarsCount),
      latestAvatar: this.mapLatestAvatar(row),
    }));
  }

  findByIdForUpdate(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .setLock('pessimistic_write')
      .where('user.id = :id', { id })
      .getOne();
  }

  async update(id: string, command: UpdateUserCommand): Promise<User | null> {
    await this.repository.update(id, command);
    return this.findById(id);
  }

  async updateBalance(id: string, balance: string): Promise<void> {
    await this.repository.update(id, { balance });
  }

  async resetAllBalances(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(User)
      .set({ balance: '0.00' })
      .where('deleted_at IS NULL')
      .execute();

    return result.affected ?? 0;
  }

  async updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    await this.repository.update(id, { refreshTokenHash });
  }

  async updateRefreshTokenState(
    id: string,
    refreshTokenHash: string,
    refreshTokenVersion: number,
  ): Promise<void> {
    await this.repository.update(id, {
      refreshTokenHash,
      refreshTokenVersion,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  private mapLatestAvatar(row: {
    latestAvatarId: string | null;
    latestAvatarFileName: string | null;
    latestAvatarOriginalName: string | null;
    latestAvatarMimeType: string | null;
    latestAvatarSize: number | null;
    latestAvatarCreatedAt: Date | null;
  }): LatestAvatarProjection | null {
    if (!row.latestAvatarId || !row.latestAvatarFileName) {
      return null;
    }

    return {
      id: row.latestAvatarId,
      fileName: row.latestAvatarFileName,
      originalName: row.latestAvatarOriginalName ?? '',
      mimeType: row.latestAvatarMimeType ?? '',
      size: Number(row.latestAvatarSize ?? 0),
      createdAt: row.latestAvatarCreatedAt ?? new Date(),
    };
  }
}
