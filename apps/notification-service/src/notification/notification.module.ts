import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { WebsocketAuthService } from './auth/websocket-auth.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationKafkaController } from './notification.kafka.controller';
import { NotificationService } from './notification.service';
import {
  NotificationRecord,
  NotificationSchema,
} from './schemas/notification.schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: NotificationRecord.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController, NotificationKafkaController],
  providers: [NotificationGateway, NotificationService, WebsocketAuthService],
})
export class NotificationModule {}
