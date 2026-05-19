import type { FastifyInstance } from "fastify";
import { requireRole } from "@/middleware/auth.js";
import type { AuthSession } from "@/middleware/auth.js";
import * as matricService from "@/services/matric.js";

export async function matricRoutes(app: FastifyInstance) {
  // POST /matric/submit — student submits matric number
  app.post(
    "/matric/submit",
    { preHandler: requireRole("student") },
    async (req, reply) => {
      const session = (req as any).session as AuthSession;
      const result = await matricService.submit(session, req.body as any);
      return reply.status(201).send(result);
    },
  );

  // GET /matric/pending — institution views pending submissions
  app.get(
    "/matric/pending",
    { preHandler: requireRole("institution") },
    async (req, reply) => {
      const session = (req as any).session as AuthSession;
      const result = await matricService.listPending(session);
      return reply.send(result);
    },
  );

  // POST /matric/:membershipId/approve — institution approves
  app.post(
    "/matric/:membershipId/approve",
    { preHandler: requireRole("institution") },
    async (req, reply) => {
      const { membershipId } = req.params as { membershipId: string };
      const session = (req as any).session as AuthSession;
      const result = await matricService.approve(membershipId, session);
      return reply.send(result);
    },
  );

  // POST /matric/:membershipId/reject — institution rejects
  app.post(
    "/matric/:membershipId/reject",
    { preHandler: requireRole("institution") },
    async (req, reply) => {
      const { membershipId } = req.params as { membershipId: string };
      const session = (req as any).session as AuthSession;
      const result = await matricService.reject(membershipId, session);
      return reply.send(result);
    },
  );
}
