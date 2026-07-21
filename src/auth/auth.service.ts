import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log(`Register attempt for login=${dto.login}`);
    const loginCandidate = await this.usersService.findByLogin(dto.login);
    if (loginCandidate) {
      throw new ConflictException('User with this login already exists');
    }

    const emailCandidate = await this.usersService.findByEmail(dto.email);
    if (emailCandidate) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
    );
    const user = await this.usersService.create({
      login: dto.login,
      email: dto.email,
      passwordHash,
      age: dto.age,
      about: dto.about,
    });

    this.logger.log(`User ${user.id} registered`);
    return this.issueAuthResponse(user);
  }

  async validateUser(login: string, password: string): Promise<User> {
    this.logger.log(`Login validation attempt for login=${login}`);
    const user = await this.usersService.findByLoginWithPassword(login);

    if (!user) {
      throw new UnauthorizedException('Invalid login or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login or password');
    }

    return user;
  }

  login(user: User): Promise<AuthResponseDto> {
    this.logger.log(`Issuing tokens for user ${user.id}`);
    return this.issueAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    this.logger.log('Refresh token attempt');
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findByIdWithSecrets(payload.sub);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is not active');
    }

    if (payload.tokenVersion !== user.refreshTokenVersion) {
      throw new UnauthorizedException('Refresh token is outdated');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.logger.log(`Refresh token accepted for user ${user.id}`);
    return this.issueAuthResponse(user);
  }

  async logout(userId: string): Promise<{ message: string }> {
    this.logger.log(`Logout for user ${userId}`);
    await this.usersService.updateRefreshTokenHash(userId, null);
    return { message: 'Logged out' };
  }

  private async issueAuthResponse(user: User): Promise<AuthResponseDto> {
    const tokenId = randomUUID();
    const nextRefreshTokenVersion = (user.refreshTokenVersion ?? 0) + 1;
    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      email: user.email,
      jti: tokenId,
      tokenVersion: nextRefreshTokenVersion,
    };
    const accessTokenOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_ACCESS_TTL',
        '15m',
      ) as JwtSignOptions['expiresIn'],
    };
    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TTL',
        '7d',
      ) as JwtSignOptions['expiresIn'],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, accessTokenOptions),
      this.jwtService.signAsync(payload, refreshTokenOptions),
    ]);

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
    );
    await this.usersService.updateRefreshTokenState(
      user.id,
      refreshTokenHash,
      nextRefreshTokenVersion,
    );
    this.logger.log(`Token pair issued for user ${user.id}`);

    return {
      accessToken,
      refreshToken,
      user: UserResponseDto.fromEntity(user),
    };
  }
}
