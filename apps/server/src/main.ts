/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */

import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { GlobalExceptionFilter } from '@/lib/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bodyParser: false,
    },
  );

  // ---------------------------------------------------------------------------
  // Global exception filter
  // Catches all unhandled exceptions and returns clean JSON.
  // Stack traces are logged server-side only — never sent to the client.
  // ---------------------------------------------------------------------------
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ---------------------------------------------------------------------------
  // Global validation pipe
  // Validates and transforms all incoming request bodies against DTO classes.
  //
  // whitelist: true         — strips properties not declared in the DTO
  // forbidNonWhitelisted    — throws 400 if unknown properties are sent
  // transform: true         — auto-converts payload types (string "1" → number 1)
  // transformOptions        — enables plain-to-class conversion without @Type()
  //                           on every property
  // ---------------------------------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
  console.log(`Server running on http://localhost:${process.env.PORT ?? 5000}`);
}

bootstrap();
