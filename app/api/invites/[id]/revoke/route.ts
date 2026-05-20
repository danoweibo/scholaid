import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// PATCH /api/invites/[id]/revoke — lecturer only (by invite id)
export const PATCH = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { session, error } = await requireRole(req, "lecturer");
    if (error) return error;

    const { id } = await params;
    const result = await invitesService.revoke(id, session);
    return NextResponse.json(result);
  },
);
