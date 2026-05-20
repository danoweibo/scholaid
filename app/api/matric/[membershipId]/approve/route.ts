import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as matricService from "@/services/matric";

// POST /api/matric/[membershipId]/approve — institution approves a matric submission
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ membershipId: string }> },
  ) => {
    const { session, error } = await requireRole(req, "institution");
    if (error) return error;

    const { membershipId } = await params;
    const result = await matricService.approve(membershipId, session);
    return NextResponse.json(result);
  },
);
