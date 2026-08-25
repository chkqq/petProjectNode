import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { BALANCE_RESET_QUEUE } from './balance-reset.constants';
import { BalanceResetController } from './balance-reset.controller';
import { BalanceResetProcessor } from './balance-reset.processor';
import { BalanceResetService } from './balance-reset.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BALANCE_RESET_QUEUE,
    }),
    UsersModule,
  ],
  controllers: [BalanceResetController],
  providers: [BalanceResetService, BalanceResetProcessor],
})
export class BalanceResetModule {}
