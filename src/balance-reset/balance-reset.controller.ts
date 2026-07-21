import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { BalanceResetService } from './balance-reset.service';
import { BalanceResetResponseDto } from './dto/balance-reset-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('balance-reset')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('balance-reset')
export class BalanceResetController {
  constructor(private readonly balanceResetService: BalanceResetService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiAcceptedResponse({ type: BalanceResetResponseDto })
  resetBalances(): Promise<BalanceResetResponseDto> {
    return this.balanceResetService.enqueueManualReset();
  }
}
