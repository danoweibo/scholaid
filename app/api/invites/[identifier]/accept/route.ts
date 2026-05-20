import { NextRequest, NextResponse } from "next/server";
import { optionalAuth, withErrorHandler } from "@/lib/auth/middleware";
import * as invitesService from "@/services/invites";

// POST /api/invites/[identifier]/accept — optional auth, accepts by token
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ identifier: string }> },
  ) => {
    const { identifier } = await params;
    const session = await optionalAuth(req);
    const result = await invitesService.accept(
      identifier,
      session?.user?.id ?? null,
    );
    return NextResponse.json(result, { status: 201 });
  },
);
