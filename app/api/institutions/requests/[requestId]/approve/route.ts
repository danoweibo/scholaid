import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as institutionsService from "@/services/institutions";

// POST /api/institutions/requests/[requestId]/approve — institution approves a lecturer request
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ requestId: string }> },
  ) => {
    const { session, error } = await requireRole(req, "institution");
    if (error) return error;

    const { requestId } = await params;
    const result = await institutionsService.approveRequest(requestId, session);
    return NextResponse.json(result);
  },
);
