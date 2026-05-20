import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// PATCH /api/invites/[identifier]/revoke — revoke by invite ID
export const PATCH = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> },
  ) => {
    const { session, error } = await requireRole(req, "lecturer");
    if (error) return error;

    const { identifier } = await params;
    const result = await invitesService.revoke(identifier, session);
    return NextResponse.json(result);
  },
);

// POST /api/invites/[identifier]/revoke — revoke by invite token
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> },
  ) => {
    const { session, error } = await requireRole(req, "lecturer");
    if (error) return error;

    const { identifier } = await params;
    const result = await invitesService.revokeByToken(identifier, session);
    return NextResponse.json(result);
  },
);
