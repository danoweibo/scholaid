import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// POST /api/invites/[token]/revoke — lecturer only (by token)
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
  ) => {
    const { session, error } = await requireRole(req, "lecturer");
    if (error) return error;

    const { token } = await params;
    const result = await invitesService.revokeByToken(token, session);
    return NextResponse.json(result);
  },
);
