import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const user = {
    id: '4dfb1112-9e2f-4b6d-9f9f-2f3fb38b57b7',
    login: 'ramir',
    email: 'ramir@example.com',
    passwordHash: '',
    refreshTokenHash: null,
    age: 23,
    about: 'NestJS enjoyer',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdWithSecrets: jest.fn(),
      findByLogin: jest.fn(),
      findByEmail: jest.fn(),
      findByLoginWithPassword: jest.fn(),
      updateMe: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
      softDelete: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn(async (_payload, options) =>
        options?.secret === 'refresh-secret' ? 'refresh-token' : 'access-token',
      ),
      verifyAsync: jest.fn(async () => ({ sub: user.id })),
    } as unknown as jest.Mocked<JwtService>;

    const config: Record<string, string | number> = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '7d',
      BCRYPT_SALT_ROUNDS: 4,
    };
    const configService = {
      get: jest.fn((key: string) => config[key]),
      getOrThrow: jest.fn((key: string) => {
        const value = config[key];
        if (value === undefined) {
          throw new Error(`Missing config key: ${key}`);
        }

        return value;
      }),
    } as unknown as ConfigService;

    service = new AuthService(usersService, jwtService, configService);
  });

  it('registers a new user and returns token pair', async () => {
    usersService.findByLogin.mockResolvedValue(null);
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockImplementation(async (command) => ({
      ...user,
      ...command,
    }));

    const result = await service.register({
      login: user.login,
      email: user.email,
      password: 'StrongPass123',
      age: user.age,
      about: user.about ?? undefined,
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(
      user.id,
      expect.any(String),
    );
  });

  it('throws conflict when login already exists', async () => {
    usersService.findByLogin.mockResolvedValue(user as never);

    await expect(
      service.register({
        login: user.login,
        email: user.email,
        password: 'StrongPass123',
        age: user.age,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('validates login and password', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123', 4);
    usersService.findByLoginWithPassword.mockResolvedValue({
      ...user,
      passwordHash,
    } as never);

    await expect(
      service.validateUser(user.login, 'StrongPass123'),
    ).resolves.toMatchObject({ id: user.id });
  });

  it('rejects wrong password', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123', 4);
    usersService.findByLoginWithPassword.mockResolvedValue({
      ...user,
      passwordHash,
    } as never);

    await expect(
      service.validateUser(user.login, 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes tokens when refresh token matches stored hash', async () => {
    const refreshTokenHash = await bcrypt.hash('refresh-token', 4);
    usersService.findByIdWithSecrets.mockResolvedValue({
      ...user,
      refreshTokenHash,
    } as never);

    const result = await service.refresh('refresh-token');

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token', {
      secret: 'refresh-secret',
    });
    expect(result).toMatchObject({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });
});
