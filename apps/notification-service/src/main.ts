import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpExceptionFilter } from '@app/common';

import { NotificationServiceModule } from './notification-service.module';

function parseKafkaBrokers(value: string | undefined): string[] {
  return (value ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(NotificationServiceModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get<string>(
          'KAFKA_NOTIFICATION_CLIENT_ID',
          'notification-service',
        ),
        brokers: parseKafkaBrokers(configService.get<string>('KAFKA_BROKERS')),
      },
      consumer: {
        groupId: configService.get<string>(
          'KAFKA_NOTIFICATION_GROUP_ID',
          'notification-service-consumer',
        ),
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(configService.get<number>('NOTIFICATION_PORT', 3001));
}

void bootstrap();
