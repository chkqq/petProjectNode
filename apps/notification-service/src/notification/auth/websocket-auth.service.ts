import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

interface AccessJwtPayload {
  sub: string;
  login: string;
  email: string;
  jti: string;
  tokenVersion: number;
}

@Injectable()
export class WebsocketAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verifyJwtFromHandshake(params: {
    authorization?: string | string[];
    authToken?: unknown;
  }): Promise<string> {
    const token = this.extractToken(params.authorization, params.authToken);
    const payload = await this.jwtService.verifyAsync<AccessJwtPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    return payload.sub;
  }

  private extractToken(
    authorization: string | string[] | undefined,
    authToken: unknown,
  ): string {
    if (typeof authToken === 'string' && authToken.trim() !== '') {
      return authToken;
    }

    const header = Array.isArray(authorization)
      ? authorization[0]
      : authorization;
    if (!header) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    return token;
  }
}
