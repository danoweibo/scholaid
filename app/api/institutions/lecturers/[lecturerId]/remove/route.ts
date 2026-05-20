import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as institutionsService from "@/services/institutions";

// POST /api/institutions/lecturers/[lecturerId]/remove — institution removes a lecturer
export const POST = withErrorHandler(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ lecturerId: string }> },
  ) => {
    const { session, error } = await requireRole(req, "institution");
    if (error) return error;

    const { lecturerId } = await params;
    const result = await institutionsService.removeLecturer(
      lecturerId,
      session,
    );
    return NextResponse.json(result);
  },
);
