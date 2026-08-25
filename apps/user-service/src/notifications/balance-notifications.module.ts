import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { BALANCE_NOTIFICATIONS_KAFKA_CLIENT } from './balance-notifications.constants';
import { BalanceNotificationsProducerService } from './balance-notifications-producer.service';

function parseKafkaBrokers(value: string | undefined): string[] {
  return (value ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: BALANCE_NOTIFICATIONS_KAFKA_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get<string>(
                'KAFKA_CLIENT_ID',
                'user-service',
              ),
              brokers: parseKafkaBrokers(
                configService.get<string>('KAFKA_BROKERS'),
              ),
            },
          },
        }),
      },
    ]),
  ],
  providers: [BalanceNotificationsProducerService],
  exports: [BalanceNotificationsProducerService],
})
export class BalanceNotificationsModule {}
