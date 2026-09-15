// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // BRD Section 44.12: Namespace all routes to /api/v1
  app.setGlobalPrefix('api/v1');

  // Enterprise Security: Global Validation & Sanitization Pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any properties that do not have decorators in the DTO
      forbidNonWhitelisted: true, // Rejects requests with unknown properties (400 Bad Request)
      transform: true, // Automatically transforms payloads to match DTO instance types
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  await app.listen(port);
  console.log(`[ABC PMS API] Running on: http://localhost:${port}/api/v1`);
}
bootstrap();