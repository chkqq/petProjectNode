import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UsersRepositoryPort } from './repositories/users.repository.port';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepositoryPort>;

  const user: User = {
    id: '4dfb1112-9e2f-4b6d-9f9f-2f3fb38b57b7',
    login: 'ramir',
    email: 'ramir@example.com',
    passwordHash: 'hash',
    refreshTokenHash: null,
    refreshTokenVersion: 0,
    balance: '0.00',
    age: 23,
    about: 'NestJS enjoyer',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  beforeEach(() => {
    repository = {
      create: jest.fn((command) => ({ ...user, ...command })),
      save: jest.fn(async (entity) => entity),
      findById: jest.fn(),
      findByIdWithSecrets: jest.fn(),
      findByLogin: jest.fn(),
      findByLoginWithPassword: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findActiveUsers: jest.fn(),
      findByIdForUpdate: jest.fn(),
      update: jest.fn(),
      updateBalance: jest.fn(),
      resetAllBalances: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
      updateRefreshTokenState: jest.fn(),
      softDelete: jest.fn(),
    };

    const configService = {
      get: jest.fn((key: string) =>
        key === 'BCRYPT_SALT_ROUNDS' ? 4 : undefined,
      ),
    } as unknown as ConfigService;

    const redisService = {
      getJson: jest.fn(async () => null),
      setJson: jest.fn(),
      deleteByPattern: jest.fn(),
    };
    const s3Service = {
      getPublicUrl: jest.fn((fileName: string) => `http://localhost/${fileName}`),
    };

    service = new UsersService(
      repository,
      configService,
      redisService as never,
      s3Service as never,
    );
  });

  it('uses repository to create a user', async () => {
    const result = await service.create({
      login: user.login,
      email: user.email,
      passwordHash: user.passwordHash,
      age: user.age,
      about: user.about ?? undefined,
    });

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(result).toMatchObject({ id: user.id, login: user.login });
  });

  it('returns paginated users response', async () => {
    repository.findAll.mockResolvedValue({
      items: [user],
      total: 1,
      page: 1,
      limit: 10,
    });

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toBeInstanceOf(UserResponseDto);
    expect(result.meta.totalPages).toBe(1);
  });

  it('throws not found when user does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findByIdOrFail(user.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('prevents changing login to an existing one', async () => {
    repository.findById.mockResolvedValue(user);
    repository.findByLogin.mockResolvedValue({ ...user, id: 'other-id' });

    await expect(
      service.updateMe(user.id, { login: 'occupied' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('soft deletes user and clears refresh token', async () => {
    repository.findById.mockResolvedValue(user);

    await service.softDelete(user.id);

    expect(repository.updateRefreshTokenHash).toHaveBeenCalledWith(
      user.id,
      null,
    );
    expect(repository.softDelete).toHaveBeenCalledWith(user.id);
  });
});
