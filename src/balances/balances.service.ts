import { Injectable, Logger } from '@nestjs/common';

import { TransferBalanceDto } from './dto/transfer-balance.dto';
import { TransferBalanceResponseDto } from './dto/transfer-balance-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class BalancesService {
  private readonly logger = new Logger(BalancesService.name);

  constructor(private readonly usersService: UsersService) {}

  async transferFromCurrentUser(
    fromUserId: string,
    dto: TransferBalanceDto,
  ): Promise<TransferBalanceResponseDto> {
    this.logger.log(
      `Balance transfer requested from ${fromUserId} to ${dto.toUserId}`,
    );
    return this.usersService.transferBalance(fromUserId, dto.toUserId, dto.amount);
  }
}
