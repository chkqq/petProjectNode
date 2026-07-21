import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import {
  BALANCE_RESET_JOB,
  BALANCE_RESET_QUEUE,
} from './balance-reset.constants';
import { UsersService } from '../users/users.service';

interface BalanceResetJobPayload {
  reason: 'manual' | 'repeatable';
}

@Processor(BALANCE_RESET_QUEUE)
export class BalanceResetProcessor {
  private readonly logger = new Logger(BalanceResetProcessor.name);

  constructor(private readonly usersService: UsersService) {}

  @Process(BALANCE_RESET_JOB)
  async handleReset(job: Job<BalanceResetJobPayload>): Promise<void> {
    this.logger.warn(
      `Balance reset job ${job.id} started. Reason: ${job.data.reason}`,
    );
    const result = await this.usersService.resetAllBalances();
    this.logger.warn(
      `Balance reset job ${job.id} completed. Updated users: ${result.updatedUsers}`,
    );
  }
}
