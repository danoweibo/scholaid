import type { FastifyInstance } from 'fastify';
import { requireAuth, requireRole, optionalAuth } from '@/middleware/auth';
import type { AuthSession } from '@/middleware/auth';
import * as invitesService from '@/services/invites';

export async function inviteRoutes(app: FastifyInstance) {
  // POST /invites — lecturer dispatches an invite
  app.post('/invites', { preHandler: requireRole('lecturer') }, async (req, reply) => {
    const session = (req as any).session as AuthSession;
    const result = await invitesService.dispatch(session, req.body as any);
    return reply.status(201).send(result);
  });

  // GET /invites/:token — public, inspect invite status
  app.get('/invites/:token', async (req, reply) => {
    const { token } = req.params as { token: string };
    const result = await invitesService.inspect(token);
    return reply.send(result);
  });

  // POST /invites/:token/accept — optional auth
  app.post('/invites/:token/accept', { preHandler: optionalAuth }, async (req, reply) => {
    const { token } = req.params as { token: string };
    const session = (req as any).session as AuthSession | null;
    const result = await invitesService.accept(token, session?.user?.id ?? null);
    return reply.status(201).send(result);
  });

  // PATCH /invites/:id/revoke — lecturer only
  app.patch('/invites/:id/revoke', { preHandler: requireRole('lecturer') }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const session = (req as any).session as AuthSession;
    const result = await invitesService.revoke(id, session);
    return reply.send(result);
  });

  // POST /invites/:token/revoke — lecturer only (by token)
  app.post('/invites/:token/revoke', { preHandler: requireRole('lecturer') }, async (req, reply) => {
    const { token } = req.params as { token: string };
    const session = (req as any).session as AuthSession;
    const result = await invitesService.revokeByToken(token, session);
    return reply.send(result);
  });
}
