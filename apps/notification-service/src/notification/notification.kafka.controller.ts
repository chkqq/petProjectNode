import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { BALANCE_TRANSFERRED_TOPIC, BalanceTransferredEvent } from '@app/common';

import { NotificationService } from './notification.service';

@Controller()
export class NotificationKafkaController {
  private readonly logger = new Logger(NotificationKafkaController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(BALANCE_TRANSFERRED_TOPIC)
  async handleBalanceTransferred(
    @Payload() event: BalanceTransferredEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    const message = context.getMessage();
    this.logger.log(
      `Kafka message received topic=${BALANCE_TRANSFERRED_TOPIC} offset=${message.offset}`,
    );
    await this.notificationService.handleBalanceTransferred(event);
  }
}
