import type { FastifyInstance } from 'fastify';
import { requireRole } from '@/middleware/auth';
import type { AuthSession } from '@/middleware/auth';
import * as institutionsService from '@/services/institutions';

export async function institutionRoutes(app: FastifyInstance) {
  // POST /institutions/connect — lecturer initiates connection
  app.post('/institutions/connect', { preHandler: requireRole('lecturer') }, async (req, reply) => {
    const session = (req as any).session as AuthSession;
    const result = await institutionsService.lecturerConnect(session, req.body as any);
    return reply.status(201).send(result);
  });

  // POST /institutions/requests/:requestId/accept — lecturer accepts institution invite
  app.post('/institutions/requests/:requestId/accept', { preHandler: requireRole('lecturer') }, async (req, reply) => {
    const { requestId } = req.params as { requestId: string };
    const session = (req as any).session as AuthSession;
    const result = await institutionsService.lecturerAcceptInvite(requestId, session);
    return reply.status(201).send(result);
  });

  // POST /institutions/leave — lecturer leaves institution
  app.post('/institutions/leave', { preHandler: requireRole('lecturer') }, async (req, reply) => {
    const session = (req as any).session as AuthSession;
    const result = await institutionsService.lecturerLeave(session);
    return reply.send(result);
  });

  // POST /institutions/lecturers/invite — institution invites a lecturer
  app.post('/institutions/lecturers/invite', { preHandler: requireRole('institution') }, async (req, reply) => {
    const session = (req as any).session as AuthSession;
    const result = await institutionsService.institutionInviteLecturer(session, req.body as any);
    return reply.status(201).send(result);
  });

  // POST /institutions/requests/:requestId/approve — institution approves request
  app.post('/institutions/requests/:requestId/approve', { preHandler: requireRole('institution') }, async (req, reply) => {
    const { requestId } = req.params as { requestId: string };
    const session = (req as any).session as AuthSession;
    const result = await institutionsService.approveRequest(requestId, session);
    return reply.send(result);
  });

  // POST /institutions/lecturers/:lecturerId/remove — institution removes lecturer
  app.post('/institutions/lecturers/:lecturerId/remove', { preHandler: requireRole('institution') }, async (req, reply) => {
    const { lecturerId } = req.params as { lecturerId: string };
    const session = (req as any).session as AuthSession;
    const result = await institutionsService.removeLecturer(lecturerId, session);
    return reply.send(result);
  });
}
