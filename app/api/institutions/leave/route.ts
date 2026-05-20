import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as institutionsService from "@/services/institutions";

// POST /api/institutions/leave — lecturer leaves institution
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, error } = await requireRole(req, "lecturer");
  if (error) return error;

  const result = await institutionsService.lecturerLeave(session);
  return NextResponse.json(result);
});
