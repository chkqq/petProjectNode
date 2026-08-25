import { BalanceTransferredEvent } from '@app/common';

export type NotificationType = 'test.notification' | 'balance.transferred';

export interface NotificationPayload {
  type: NotificationType;
  message: string;
  data: BalanceTransferredEvent | { message: string };
  occurredAt: string;
}
