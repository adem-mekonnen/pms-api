// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor'; // 1. Added
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';   // 2. Added

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // BRD Section 44.12: Global prefix
  app.setGlobalPrefix('api/v1');

  // 3. Put on the Gift Wrapper for all successful responses
  app.useGlobalInterceptors(new TransformInterceptor());

  // 4. Put on the Gentle Guard to catch all errors
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // 5. Input Validation & Whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  await app.listen(port);
  console.log(`[ABC PMS API] Running on: http://localhost:${port}/api/v1`);
}
bootstrap();