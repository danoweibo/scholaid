// @lib/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

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
 * Reads the session from better-auth using request headers.
 * Returns null if no valid session exists.
 */
export async function getSession(
  req: NextRequest,
): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: req.headers });
  return session as AuthSession | null;
}

/**
 * Requires a valid session. Returns a 401 response if not authenticated.
 * Usage:
 *   const { session, error } = await requireAuth(req);
 *   if (error) return error;
 */
export async function requireAuth(
  req: NextRequest,
): Promise<
  { session: AuthSession; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSession(req);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { statusCode: 401, message: "Unauthorized", error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }
  return { session, error: null };
}

/**
 * Requires a valid session AND one of the given scholaidRoles.
 * Returns 401 if not authenticated, 403 if wrong role.
 */
export async function requireRole(
  req: NextRequest,
  ...roles: ScholaidUser["scholaidRole"][]
): Promise<
  { session: AuthSession; error: null } | { session: null; error: NextResponse }
> {
  const result = await requireAuth(req);
  if (result.error) return result;

  const { session } = result;
  if (!roles.includes(session.user.scholaidRole)) {
    return {
      session: null,
      error: NextResponse.json(
        {
          statusCode: 403,
          message: `Access restricted to: ${roles.join(", ")}. Your role: ${session.user.scholaidRole}.`,
          error: "Forbidden",
        },
        { status: 403 },
      ),
    };
  }
  return { session, error: null };
}

/**
 * Returns the session if present, or null — never errors.
 */
export async function optionalAuth(
  req: NextRequest,
): Promise<AuthSession | null> {
  return getSession(req);
}

/**
 * Wraps an API handler with standardised error handling.
 * Thrown objects with { statusCode, message } are forwarded as-is.
 * All other errors become 500.
 */
export function withErrorHandler(
  handler: (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> },
  ) => Promise<NextResponse>,
) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error: unknown) {
      const err = error as {
        statusCode?: number;
        message?: string;
        name?: string;
      };
      const statusCode = err.statusCode ?? 500;
      if (statusCode >= 500) {
        console.error("[API Error]", error);
        return NextResponse.json(
          {
            statusCode: 500,
            message: "An unexpected error occurred.",
            error: "Internal Server Error",
          },
          { status: 500 },
        );
      }
      return NextResponse.json(
        {
          statusCode,
          message: err.message ?? "An error occurred.",
          error: err.name ?? "Error",
        },
        { status: statusCode },
      );
    }
  };
}
