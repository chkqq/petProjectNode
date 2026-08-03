import { BadRequestException } from '@nestjs/common';

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export function normalizeMoneyAmount(value: string): string {
  if (!MONEY_PATTERN.test(value)) {
    throw new BadRequestException(
      'Amount must be a positive decimal number with up to 2 decimal places',
    );
  }

  const cents = moneyToCents(value);
  if (cents <= 0n) {
    throw new BadRequestException('Amount must be greater than 0');
  }

  return centsToMoney(cents);
}

export function moneyToCents(value: string): bigint {
  if (!MONEY_PATTERN.test(value)) {
    throw new BadRequestException(
      'Money value must have up to 2 decimal places',
    );
  }

  const [dollars, cents = ''] = value.split('.');
  return BigInt(dollars) * 100n + BigInt(cents.padEnd(2, '0'));
}

export function centsToMoney(cents: bigint): string {
  const dollars = cents / 100n;
  const rest = cents % 100n;
  return `${dollars}.${rest.toString().padStart(2, '0')}`;
}
