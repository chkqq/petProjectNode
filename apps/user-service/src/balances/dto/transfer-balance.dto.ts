import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Matches } from 'class-validator';

export class TransferBalanceDto {
  @ApiProperty({ example: '4dfb1112-9e2f-4b6d-9f9f-2f3fb38b57b7' })
  @IsUUID()
  toUserId: string;

  @ApiProperty({ example: '20.51' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'amount must be a positive decimal number with up to 2 decimals',
  })
  amount: string;
}
