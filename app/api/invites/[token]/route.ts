import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// GET /api/invites/[token] — public, inspect invite status
export const GET = withErrorHandler(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
  ) => {
    const { token } = await params;
    const result = await invitesService.inspect(token);
    return NextResponse.json(result);
  },
);
