import { NextRequest, NextResponse } from "next/server";
import { optionalAuth, withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// POST /api/invites/[token]/accept — optional auth
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ token: string }> },
  ) => {
    const { token } = await params;
    const session = await optionalAuth(req);
    const result = await invitesService.accept(
      token,
      session?.user?.id ?? null,
    );
    return NextResponse.json(result, { status: 201 });
  },
);
