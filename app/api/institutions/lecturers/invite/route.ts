import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as institutionsService from "@/services/institutions";

// POST /api/institutions/lecturers/invite — institution invites a lecturer
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, error } = await requireRole(req, "institution");
  if (error) return error;

  const body = await req.json();
  const result = await institutionsService.institutionInviteLecturer(
    session,
    body,
  );
  return NextResponse.json(result, { status: 201 });
});
