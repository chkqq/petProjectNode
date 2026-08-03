import { ApiProperty } from '@nestjs/swagger';

export class BalanceResetResponseDto {
  @ApiProperty({ example: 'Balance reset job was queued' })
  message: string;

  @ApiProperty({ example: '42' })
  jobId: string;
}
