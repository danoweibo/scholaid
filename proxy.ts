import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/middleware";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roleDashboard(role: string): string {
  if (role === "lecturer") return "/lecturer/dashboard";
  if (role === "institution") return "/institution/dashboard";
  return "/student/dashboard";
}

function redirect(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ── 1. Verify-email callback ───────────────────────────────────────────────
  // better-auth redirects to /?verified=true after email verification.
  // Signed-in users on "/" are otherwise left alone (homepage is public).
  if (pathname === "/" && searchParams.get("verified") === "true") {
    const session = await getSession(req);
    if (session?.user) return redirect(req, "/verify-email/success");
    // Token invalid / session not established — just show the homepage
    return NextResponse.next();
  }

  // ── 2. /dashboard → role dashboard (or signin if no session) ──────────────
  if (pathname === "/dashboard") {
    const session = await getSession(req);
    if (!session?.user) return redirect(req, "/signin");
    return redirect(req, roleDashboard(session.user.scholaidRole));
  }

  // ── 3. Role root shortcuts ─────────────────────────────────────────────────
  // /student → /student/dashboard, /lecturer → /lecturer/dashboard, etc.
  if (
    pathname === "/student" ||
    pathname === "/lecturer" ||
    pathname === "/institution"
  ) {
    return redirect(req, `${pathname}/dashboard`);
  }

  // ── 4. Auth pages — bounce signed-in users to their dashboard ─────────────
  if (pathname === "/signin" || pathname === "/signup") {
    const session = await getSession(req);
    if (session?.user)
      return redirect(req, roleDashboard(session.user.scholaidRole));
    return NextResponse.next();
  }

  // ── 5. Protected dashboard routes ─────────────────────────────────────────
  const isProtected =
    pathname.startsWith("/student/") ||
    pathname.startsWith("/lecturer/") ||
    pathname.startsWith("/institution/");

  if (isProtected) {
    const session = await getSession(req);
    if (!session?.user) return redirect(req, "/signin");

    // Role enforcement — prevent cross-role access
    const role = session.user.scholaidRole;
    if (pathname.startsWith("/student/") && role !== "student") {
      return redirect(req, roleDashboard(role));
    }
    if (pathname.startsWith("/lecturer/") && role !== "lecturer") {
      return redirect(req, roleDashboard(role));
    }
    if (pathname.startsWith("/institution/") && role !== "institution") {
      return redirect(req, roleDashboard(role));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — skip static files and better-auth's own API routes
// ---------------------------------------------------------------------------

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|visuals|api/auth).*)",
  ],
};
