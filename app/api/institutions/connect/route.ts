import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as institutionsService from "@/services/institutions";

// POST /api/institutions/connect — lecturer initiates connection
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, error } = await requireRole(req, "lecturer");
  if (error) return error;

  const body = await req.json();
  const result = await institutionsService.lecturerConnect(session, body);
  return NextResponse.json(result, { status: 201 });
});
