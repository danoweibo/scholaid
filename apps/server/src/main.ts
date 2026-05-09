/* eslint-disable @typescript-eslint/no-floating-promises */

import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bodyParser: false,
    },
  );

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
  console.log(`Server running on http://localhost:${process.env.PORT ?? 5000}`);
}

bootstrap();
