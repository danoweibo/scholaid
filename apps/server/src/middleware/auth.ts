import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@/auth/index.js";

export type ScholaidUser = {
  id: string;
  name: string;
  email: string;
  scholaidRole: "student" | "lecturer" | "institution";
  institutionName?: string | null;
  role: string;
};

export type AuthSession = {
  user: ScholaidUser;
  session: { id: string; token: string; expiresAt: Date; userId: string };
};

/**
 * Reads the session from better-auth using the request headers.
 * Returns null if no valid session exists.
 */
export async function getSession(
  req: FastifyRequest,
): Promise<AuthSession | null> {
  const session = await auth.api.getSession({
    headers: req.headers as unknown as Headers,
  });
  return session as AuthSession | null;
}

/**
 * Route preHandler — requires a valid session.
 * Attaches session to request as req.session.
 * Returns 401 if not authenticated.
 */
export async function requireAuth(
  req: FastifyRequest & { session?: AuthSession },
  reply: FastifyReply,
) {
  const session = await getSession(req);
  if (!session) {
    return reply
      .status(401)
      .send({
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      });
  }
  req.session = session;
}

/**
 * Route preHandler — requires a valid session AND a specific scholaidRole.
 */
export function requireRole(...roles: ScholaidUser["scholaidRole"][]) {
  return async function (
    req: FastifyRequest & { session?: AuthSession },
    reply: FastifyReply,
  ) {
    await requireAuth(req, reply);
    if (reply.sent) return;
    const role = req.session!.user.scholaidRole;
    if (!roles.includes(role)) {
      return reply.status(403).send({
        statusCode: 403,
        message: `Access restricted to: ${roles.join(", ")}. Your role: ${role}.`,
        error: "Forbidden",
      });
    }
  };
}

/**
 * Route preHandler — attaches session if present but does not require it.
 * req.session will be null if unauthenticated.
 */
export async function optionalAuth(
  req: FastifyRequest & { session?: AuthSession | null },
) {
  req.session = await getSession(req);
}
