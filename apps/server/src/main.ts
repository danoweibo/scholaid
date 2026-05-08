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

  // ---------------------------------------------------------------------------
  // CORS
  // better-auth handles CORS for /api/auth/* via trustedOrigins in auth.ts.
  // enableCors() covers all other NestJS feature routes.
  // credentials: true is required so the browser sends the session cookie.
  // ---------------------------------------------------------------------------
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // No origin header = Postman / curl / server-to-server — always allow
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
  console.log(`Server running on http://localhost:${process.env.PORT ?? 5000}`);
}

bootstrap();
