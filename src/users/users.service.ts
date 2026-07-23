import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import {
  PaginatedUsersResponseDto,
  PaginationMetaDto,
} from './dto/paginated-users-response.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import {
  CreateUserCommand,
  USERS_REPOSITORY,
  UsersRepositoryPort,
} from './repositories/users.repository.port';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async create(command: CreateUserCommand): Promise<User> {
    const user = this.usersRepository.create(command);
    return this.usersRepository.save(user);
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
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }

  async findAll(query: QueryUsersDto): Promise<PaginatedUsersResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
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

    return {
      items: result.items.map(UserResponseDto.fromEntity),
      meta,
    };
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
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

    // БЛОКЕР
    // Пароль меняется, а refreshTokenHash и refreshTokenVersion остаются как
    // были. Значит смена пароля никого не разлогинивает
    //
    // Смотри, что получается: у человека увели refresh-токен. Он идёт менять
    // пароль — это единственное, что обычный пользователь умеет сделать в
    // такой ситуации. А токен продолжает жить ещё JWT_REFRESH_TTL (у тебя по
    // умолчанию 7 дней), и всё это время злоумышленник спокойно выписывает
    // себе свежие пары через /auth/refresh
    //
    // Обиднее всего, что механизм отзыва у тебя уже написан и работает:
    // logout обнуляет хеш, refresh это проверяет (auth.service.ts:83).
    // Просто дёрни updateRefreshTokenHash(id, null), когда dto.password задан
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
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

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
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.updateRefreshTokenHash(id, null);
    await this.usersRepository.softDelete(id);
  }
}
