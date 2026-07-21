import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';
import { Avatar } from './entities/avatar.entity';
import { TypeOrmAvatarsRepository } from './repositories/typeorm-avatars.repository';
import { AVATARS_REPOSITORY } from './repositories/avatars.repository.port';
import { S3Module } from '../providers/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar]), S3Module],
  controllers: [AvatarsController],
  providers: [
    AvatarsService,
    {
      provide: AVATARS_REPOSITORY,
      useClass: TypeOrmAvatarsRepository,
    },
  ],
  exports: [AvatarsService],
})
export class AvatarsModule {}
