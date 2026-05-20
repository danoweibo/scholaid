import { NextRequest, NextResponse } from "next/server";
import { requireRole, withErrorHandler } from "@/lib/auth/middleware";
import * as matricService from "@/services/matric";

// POST /api/matric/submit — student submits matric number
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { session, error } = await requireRole(req, "student");
  if (error) return error;

  const body = await req.json();
  const result = await matricService.submit(session, body);
  return NextResponse.json(result, { status: 201 });
});
