import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../users/dto/user-response.dto';

export class TransferBalanceResponseDto {
  @ApiProperty({ example: '20.51' })
  amount: string;

  @ApiProperty({ type: UserResponseDto })
  from: UserResponseDto;

  @ApiProperty({ type: UserResponseDto })
  to: UserResponseDto;
}
