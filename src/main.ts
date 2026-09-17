// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 1. Imported Swagger
import { AppModule } from '@/app.module';

// Clean @common/* aliases
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { GlobalHttpExceptionFilter } from '@common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // BRD Section 44.12: Global prefix
  app.setGlobalPrefix('api/v1');

  // Response Box Wrapper & Error Guard
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Input Validation & Whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. Configure OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('ABC PMS API')
    .setDescription(
      'Property Management & Rent Collection Platform (BRD v2.2) — Multi-Tenant SaaS with Chapa Integration',
    )
    .setVersion('2.2')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT accessToken',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  await app.listen(port);
  console.log(`[ABC PMS API] Running on: http://localhost:${port}/api/v1`);
  console.log(`[Swagger Docs] Available on: http://localhost:${port}/api/docs`);
}
bootstrap();