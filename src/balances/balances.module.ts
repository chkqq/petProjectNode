import { Module } from '@nestjs/common';

import { BalancesController } from './balances.controller';
import { BalancesService } from './balances.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [BalancesController],
  providers: [BalancesService],
})
export class BalancesModule {}
