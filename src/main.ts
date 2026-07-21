import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

import { AppModule } from './app.module';
import { setupApp } from './app.setup';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule);

  setupApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pet Project Node API')
    .setDescription('CRUD API for users with JWT access/refresh authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
