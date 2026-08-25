import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BalanceTransferredEvent } from '@app/common';
import { Model } from 'mongoose';

import { NotificationPayload } from './interfaces/notification-payload.interface';
import {
  NotificationDocument,
  NotificationRecord,
} from './schemas/notification.schema';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationGateway: NotificationGateway,
    @InjectModel(NotificationRecord.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async sendTestNotification(
    userId: string,
    message: string,
  ): Promise<void> {
    const payload: NotificationPayload = {
      type: 'test.notification',
      message,
      data: { message },
      occurredAt: new Date().toISOString(),
    };

    this.notificationGateway.sendNotification(userId, payload);
  }

  async handleBalanceTransferred(
    event: BalanceTransferredEvent,
  ): Promise<void> {
    this.logger.log(
      `Balance transferred event ${event.eventId}: ${event.fromUserId} -> ${event.toUserId}`,
    );

    await this.saveBalanceNotifications(event);
    this.notificationGateway.sendNotification(
      event.fromUserId,
      this.buildBalanceNotification(event, 'sent'),
    );
    this.notificationGateway.sendNotification(
      event.toUserId,
      this.buildBalanceNotification(event, 'received'),
    );
  }

  private async saveBalanceNotifications(
    event: BalanceTransferredEvent,
  ): Promise<void> {
    await this.notificationModel.insertMany([
      {
        recipientUserId: event.fromUserId,
        type: 'balance.transferred',
        fromUserId: event.fromUserId,
        toUserId: event.toUserId,
        amount: event.amount,
        message: `You sent $${event.amount}`,
        occurredAt: new Date(event.occurredAt),
      },
      {
        recipientUserId: event.toUserId,
        type: 'balance.transferred',
        fromUserId: event.fromUserId,
        toUserId: event.toUserId,
        amount: event.amount,
        message: `You received $${event.amount}`,
        occurredAt: new Date(event.occurredAt),
      },
    ]);
  }

  private buildBalanceNotification(
    event: BalanceTransferredEvent,
    direction: 'sent' | 'received',
  ): NotificationPayload {
    return {
      type: 'balance.transferred',
      message:
        direction === 'sent'
          ? `Transfer completed: you sent $${event.amount}`
          : `Transfer completed: you received $${event.amount}`,
      data: event,
      occurredAt: event.occurredAt,
    };
  }
}
