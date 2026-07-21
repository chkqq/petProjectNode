import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { TypeOrmUsersRepository } from './repositories/typeorm-users.repository';
import { USERS_REPOSITORY } from './repositories/users.repository.port';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RedisModule } from '../providers/redis/redis.module';
import { S3Module } from '../providers/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RedisModule, S3Module],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
