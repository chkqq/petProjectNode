import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';

export function setupApp(app: INestApplication): void {
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix(configService.get<string>('API_PREFIX', 'api'));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}
