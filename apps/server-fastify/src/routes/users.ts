import type { FastifyInstance } from 'fastify';
import { requireAuth } from '@/middleware/auth';
import type { AuthSession } from '@/middleware/auth';

export async function userRoutes(app: FastifyInstance) {
  // GET /users/me — any authenticated user
  app.get('/users/me', { preHandler: requireAuth }, async (req, reply) => {
    const session = (req as any).session as AuthSession;
    return reply.send({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      scholaidRole: session.user.scholaidRole,
      institutionName: session.user.institutionName ?? null,
    });
  });
}
