import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// GET /api/invites/[identifier] — public, inspect invite status by token
export const GET = withErrorHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> },
  ) => {
    const { identifier } = await params;
    const result = await invitesService.inspect(identifier);
    return NextResponse.json(result);
  },
);
