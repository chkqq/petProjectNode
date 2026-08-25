export const BALANCE_TRANSFERRED_TOPIC = 'balance.transferred';

export interface BalanceTransferredEvent {
  eventId: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  fromBalance: string;
  toBalance: string;
  occurredAt: string;
}
