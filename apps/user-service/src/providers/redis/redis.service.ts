import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const password = this.configService.get<string>('REDIS_PASSWORD', '');
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: password || undefined,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    this.client.on('error', (error) => {
      this.logger.warn(`Redis error: ${error.message}`);
    });
  }

  getNativeClient(): Redis {
    return this.client;
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      await this.connectIfNeeded();
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.warn(`Cache read skipped for ${key}: ${this.message(error)}`);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.connectIfNeeded();
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(`Cache write skipped for ${key}: ${this.message(error)}`);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      await this.connectIfNeeded();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      this.logger.warn(
        `Cache invalidation skipped for ${pattern}: ${this.message(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  private async connectIfNeeded(): Promise<void> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
