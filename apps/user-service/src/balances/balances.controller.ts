import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BalancesService } from './balances.service';
import { TransferBalanceDto } from './dto/transfer-balance.dto';
import { TransferBalanceResponseDto } from './dto/transfer-balance-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';

@ApiTags('balances')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TransferBalanceResponseDto })
  transfer(
    @CurrentUser() user: RequestUser,
    @Body() dto: TransferBalanceDto,
  ): Promise<TransferBalanceResponseDto> {
    return this.balancesService.transferFromCurrentUser(user.id, dto);
  }
}
