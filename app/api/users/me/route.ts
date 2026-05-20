import { NextRequest, NextResponse } from "next/server";
import { requireAuth, withErrorHandler } from "@/lib/auth/middleware";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { session, error } = await requireAuth(req);
  if (error) return error;

  return NextResponse.json({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    scholaidRole: session.user.scholaidRole,
    institutionName: session.user.institutionName ?? null,
  });
});
