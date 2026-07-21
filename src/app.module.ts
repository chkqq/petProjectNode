import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AvatarsModule } from './avatars/avatars.module';
import { BalanceResetModule } from './balance-reset/balance-reset.module';
import { BalancesModule } from './balances/balances.module';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './config/env.validation';
import { AddAvatarsAndBalances1730000000000 } from './database/migrations/1730000000000-AddAvatarsAndBalances';
import { InitialUsers1720000000000 } from './database/migrations/1720000000000-InitialUsers';
import { RedisModule } from './providers/redis/redis.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        migrations: [
          InitialUsers1720000000000,
          AddAvatarsAndBalances1730000000000,
        ],
        migrationsRun: configService.get<boolean>('DB_MIGRATIONS_RUN'),
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
      }),
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid TypeORM options');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    AvatarsModule,
    BalancesModule,
    BalanceResetModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
