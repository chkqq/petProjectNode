import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import {
  CreateUserCommand,
  FindAllUsersParams,
  PaginatedUsers,
  UpdateUserCommand,
  UsersRepositoryPort,
} from './users.repository.port';
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

  async update(id: string, command: UpdateUserCommand): Promise<User | null> {
    await this.repository.update(id, command);
    return this.findById(id);
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
}
