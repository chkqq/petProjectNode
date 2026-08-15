import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  BALANCE_TRANSFERRED_TOPIC,
  BalanceTransferredEvent,
} from '@app/common';
import { lastValueFrom } from 'rxjs';

import { BALANCE_NOTIFICATIONS_KAFKA_CLIENT } from './balance-notifications.constants';

@Injectable()
export class BalanceNotificationsProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(BalanceNotificationsProducerService.name);

  constructor(
    @Inject(BALANCE_NOTIFICATIONS_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async emitBalanceTransferred(event: BalanceTransferredEvent): Promise<void> {
    this.logger.log(
      `Publishing ${BALANCE_TRANSFERRED_TOPIC}: ${event.fromUserId} -> ${event.toUserId}`,
    );
    await lastValueFrom(
      this.kafkaClient.emit<BalanceTransferredEvent>(
        BALANCE_TRANSFERRED_TOPIC,
        event,
      ),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.kafkaClient.close();
  }
}
