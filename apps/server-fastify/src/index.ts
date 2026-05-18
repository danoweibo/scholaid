import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '@/auth/index';
import { inviteRoutes } from '@/routes/invites';
import { institutionRoutes } from '@/routes/institutions';
import { matricRoutes } from '@/routes/matric';
import { userRoutes } from '@/routes/users';

const app = Fastify({ logger: true });

// ---------------------------------------------------------------------------
// CORS — must be registered before routes
// ---------------------------------------------------------------------------
await app.register(cors, {
  origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ---------------------------------------------------------------------------
// better-auth — mounts all /api/auth/* routes via native Node handler
// Fastify's addContentTypeParser lets better-auth read the raw body itself
// ---------------------------------------------------------------------------
app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
  try {
    done(null, JSON.parse((body as Buffer).toString('utf8')));
  } catch (err) {
    done(err as Error, undefined);
  }
});

// Mount better-auth on /api/auth/* using Fastify's raw handler
app.all('/api/auth/*', async (req, reply) => {
  const nodeHandler = toNodeHandler(auth);
  await new Promise<void>((resolve, reject) => {
    nodeHandler(req.raw, reply.raw, (err?: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });
  reply.hijack();
});

// ---------------------------------------------------------------------------
// Feature routes
// ---------------------------------------------------------------------------
await app.register(inviteRoutes);
await app.register(institutionRoutes);
await app.register(matricRoutes);
await app.register(userRoutes);

// Root health check
app.get('/', async () => ({ message: 'Welcome to Scholaid!' }));

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.setErrorHandler((error, req, reply) => {
  const statusCode = (error as any).statusCode ?? 500;
  const message = error.message ?? 'An unexpected error occurred.';

  if (statusCode >= 500) {
    app.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      message: 'An unexpected error occurred.',
      error: 'Internal Server Error',
    });
  }

  return reply.status(statusCode).send({
    statusCode,
    message,
    error: error.name ?? 'Error',
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const port = Number(process.env.PORT ?? 5000);
await app.listen({ port, host: '0.0.0.0' });
console.log(`Server running on http://0.0.0.0:${port}`);
