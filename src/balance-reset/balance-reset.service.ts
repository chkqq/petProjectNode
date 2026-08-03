import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';

import {
  BALANCE_RESET_JOB,
  BALANCE_RESET_QUEUE,
} from './balance-reset.constants';
import { BalanceResetResponseDto } from './dto/balance-reset-response.dto';

@Injectable()
export class BalanceResetService implements OnModuleInit {
  private readonly logger = new Logger(BalanceResetService.name);

  constructor(
    @InjectQueue(BALANCE_RESET_QUEUE)
    private readonly queue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const repeatEveryMs = this.configService.get<number>(
      'BALANCE_RESET_REPEAT_MS',
      600000,
    );

    await this.queue.add(
      BALANCE_RESET_JOB,
      { reason: 'repeatable' },
      {
        jobId: 'repeatable-balance-reset',
        repeat: {
          every: repeatEveryMs,
        },
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );

    this.logger.log(`Repeatable balance reset job configured: ${repeatEveryMs}ms`);
  }

  async enqueueManualReset(): Promise<BalanceResetResponseDto> {
    this.logger.warn('Manual balance reset job requested');
    const job = await this.queue.add(
      BALANCE_RESET_JOB,
      { reason: 'manual' },
      {
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );

    return {
      message: 'Balance reset job was queued',
      jobId: String(job.id),
    };
  }
}
