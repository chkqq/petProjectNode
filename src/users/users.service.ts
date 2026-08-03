import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transactional } from 'typeorm-transactional';
import * as bcrypt from 'bcryptjs';

import { ActiveUserResponseDto } from './dto/active-user-response.dto';
import {
  PaginatedUsersResponseDto,
  PaginationMetaDto,
} from './dto/paginated-users-response.dto';
import { QueryActiveUsersDto } from './dto/query-active-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import {
  CreateUserCommand,
  USERS_REPOSITORY,
  UsersRepositoryPort,
} from './repositories/users.repository.port';
import {
  centsToMoney,
  moneyToCents,
  normalizeMoneyAmount,
} from '../common/utils/money';
import { RedisService } from '../providers/redis/redis.service';
import { S3Service } from '../providers/s3/s3.service';

export interface TransferBalanceResult {
  from: UserResponseDto;
  to: UserResponseDto;
  amount: string;
}

export interface ResetBalancesResult {
  updatedUsers: number;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
  ) {}

  async create(command: CreateUserCommand): Promise<User> {
    this.logger.log(`Creating user ${command.login}`);
    const user = this.usersRepository.create(command);
    const savedUser = await this.usersRepository.save(user);
    await this.invalidateUsersCache();
    return savedUser;
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findByIdWithSecrets(id: string): Promise<User | null> {
    return this.usersRepository.findByIdWithSecrets(id);
  }

  findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findByLogin(login);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findByLoginWithPassword(login: string): Promise<User | null> {
    return this.usersRepository.findByLoginWithPassword(login);
  }

  async findByIdOrFail(id: string): Promise<UserResponseDto> {
    const cacheKey = `users:one:${id}`;
    const cached = await this.redisService.getJson<UserResponseDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    this.logger.log(`Loading user ${id}`);
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const response = UserResponseDto.fromEntity(user);
    await this.redisService.setJson(cacheKey, response, this.getCacheTtl());
    return response;
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedUsersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const cacheKey = `users:all:${JSON.stringify({
      page,
      limit,
      login: query.login ?? '',
    })}`;
    const cached =
      await this.redisService.getJson<PaginatedUsersResponseDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    this.logger.log(
      `Loading users page=${page} limit=${limit} login=${query.login ?? ''}`,
    );
    const result = await this.usersRepository.findAll({
      page,
      limit,
      login: query.login,
    });

    const meta: PaginationMetaDto = {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit) || 1,
    };

    const response = {
      items: result.items.map(UserResponseDto.fromEntity),
      meta,
    };

    await this.redisService.setJson(cacheKey, response, this.getCacheTtl());
    return response;
  }

  async findActiveUsers(
    query: QueryActiveUsersDto,
  ): Promise<ActiveUserResponseDto[]> {
    if (query.minAge > query.maxAge) {
      throw new BadRequestException('minAge must be less than or equal to maxAge');
    }

    this.logger.log(
      `Loading active users minAge=${query.minAge} maxAge=${query.maxAge}`,
    );
    const users = await this.usersRepository.findActiveUsers({
      minAge: query.minAge,
      maxAge: query.maxAge,
    });

    return users.map((user) =>
      ActiveUserResponseDto.fromProjection(
        user,
        user.latestAvatar
          ? this.s3Service.getPublicUrl(user.latestAvatar.fileName)
          : null,
      ),
    );
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Updating profile ${id}`);
    const currentUser = await this.usersRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.login && dto.login !== currentUser.login) {
      const loginCandidate = await this.usersRepository.findByLogin(dto.login);
      if (loginCandidate && loginCandidate.id !== id) {
        throw new ConflictException('User with this login already exists');
      }
    }

    if (dto.email && dto.email !== currentUser.email) {
      const emailCandidate = await this.usersRepository.findByEmail(dto.email);
      if (emailCandidate && emailCandidate.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(
          dto.password,
          this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
        )
      : undefined;

    const updatedUser = await this.usersRepository.update(id, {
      login: dto.login,
      email: dto.email,
      age: dto.age,
      about: dto.about,
      passwordHash,
      refreshTokenHash: dto.password ? null : undefined,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      this.logger.log(`Refresh token was revoked after password change ${id}`);
    }

    await this.invalidateUsersCache(id);
    return UserResponseDto.fromEntity(updatedUser);
  }

  updateRefreshTokenHash(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    return this.usersRepository.updateRefreshTokenHash(id, refreshTokenHash);
  }

  updateRefreshTokenState(
    id: string,
    refreshTokenHash: string,
    refreshTokenVersion: number,
  ): Promise<void> {
    return this.usersRepository.updateRefreshTokenState(
      id,
      refreshTokenHash,
      refreshTokenVersion,
    );
  }

  async softDelete(id: string): Promise<void> {
    this.logger.log(`Soft deleting user ${id}`);
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.updateRefreshTokenHash(id, null);
    await this.usersRepository.softDelete(id);
    await this.invalidateUsersCache(id);
  }

  @Transactional()
  async transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: string,
  ): Promise<TransferBalanceResult> {
    this.logger.log(
      `Transferring ${amount} from user ${fromUserId} to user ${toUserId}`,
    );

    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer money to the same user');
    }

    const normalizedAmount = normalizeMoneyAmount(amount);
    const amountCents = moneyToCents(normalizedAmount);
    const [firstUserId, secondUserId] = [fromUserId, toUserId].sort();
    const firstUser = await this.usersRepository.findByIdForUpdate(firstUserId);
    const secondUser =
      await this.usersRepository.findByIdForUpdate(secondUserId);

    if (!firstUser || !secondUser) {
      throw new NotFoundException('Transfer participant not found');
    }

    const sender = firstUser.id === fromUserId ? firstUser : secondUser;
    const receiver = firstUser.id === toUserId ? firstUser : secondUser;
    const senderBalanceCents = moneyToCents(sender.balance);

    if (senderBalanceCents < amountCents) {
      throw new BadRequestException('Insufficient funds');
    }

    const receiverBalanceCents = moneyToCents(receiver.balance);
    const nextSenderBalance = centsToMoney(senderBalanceCents - amountCents);
    const nextReceiverBalance = centsToMoney(receiverBalanceCents + amountCents);

    await this.usersRepository.updateBalance(sender.id, nextSenderBalance);
    await this.usersRepository.updateBalance(receiver.id, nextReceiverBalance);
    await this.invalidateUsersCache(sender.id);
    await this.invalidateUsersCache(receiver.id);

    this.logger.log(
      `Transfer completed: ${sender.id}=${nextSenderBalance}, ${receiver.id}=${nextReceiverBalance}`,
    );

    return {
      amount: normalizedAmount,
      from: UserResponseDto.fromEntity({
        ...sender,
        balance: nextSenderBalance,
      }),
      to: UserResponseDto.fromEntity({
        ...receiver,
        balance: nextReceiverBalance,
      }),
    };
  }

  @Transactional()
  async resetAllBalances(): Promise<ResetBalancesResult> {
    this.logger.warn('Resetting balances for all users');
    const updatedUsers = await this.usersRepository.resetAllBalances();
    await this.invalidateUsersCache();
    this.logger.warn(`Balances were reset for ${updatedUsers} users`);
    return { updatedUsers };
  }

  private getCacheTtl(): number {
    return this.configService.get<number>('REDIS_CACHE_TTL_SECONDS', 30);
  }

  private async invalidateUsersCache(userId?: string): Promise<void> {
    await this.redisService.deleteByPattern('users:all:*');
    if (userId) {
      await this.redisService.deleteByPattern(`users:one:${userId}`);
    } else {
      await this.redisService.deleteByPattern('users:one:*');
    }
  }
}
