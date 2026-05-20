import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as matricService from "@/services/matric";

// GET /api/matric/pending — institution views pending matric submissions
export const GET = withErrorHandler(async (req: NextRequest) => {
  const { session, error } = await requireRole(req, "institution");
  if (error) return error;

  const result = await matricService.listPending(session);
  return NextResponse.json(result);
});
