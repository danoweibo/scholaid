import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/middleware";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function roleDashboard(role: string): string {
  if (role === "lecturer") return "/lecturer/dashboard";
  if (role === "institution") return "/institution/dashboard";
  return "/student/dashboard"; // default / student
}

function redirect(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url));
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ── 1. Better-auth verify-email callback ──────────────────────────────────
  // Better-auth lands on /?token=... or /api/auth/callback?... after email
  // verification. We detect the token on the root path and redirect to the
  // success page, letting better-auth's own handler do the verification first
  // via the /api/auth route (which is excluded from this middleware below).
  //
  // The real intercept: after better-auth verifies and auto-signs the user in
  // it redirects to "/". We catch that landing, check for a fresh verified
  // session, and forward to the success page instead.
  if (pathname === "/") {
    const session = await getSession(req);
    if (session?.user) {
      // User just landed on "/" while authenticated — came from verification
      // link or direct navigation. Either way, route them purposefully.
      const fromVerify = searchParams.get("verified") === "true";
      if (fromVerify) {
        return redirect(req, "/verify-email/success");
      }
      // Authenticated users hitting "/" go straight to their dashboard
      return redirect(req, roleDashboard(session.user.scholaidRole));
    }
    return NextResponse.next();
  }

  // ── 2. /dashboard → role dashboard (or signin if no session) ─────────────
  if (pathname === "/dashboard") {
    const session = await getSession(req);
    if (!session?.user) return redirect(req, "/signin");
    return redirect(req, roleDashboard(session.user.scholaidRole));
  }

  // ── 3. Role root shortcuts ────────────────────────────────────────────────
  // /student → /student/dashboard, /lecturer → /lecturer/dashboard, etc.
  if (
    pathname === "/student" ||
    pathname === "/lecturer" ||
    pathname === "/institution"
  ) {
    return redirect(req, `${pathname}/dashboard`);
  }

  // ── 4. Auth pages (signin / signup) redirect away if already signed in ────
  if (pathname === "/signin" || pathname === "/signup") {
    const session = await getSession(req);
    if (session?.user) {
      return redirect(req, roleDashboard(session.user.scholaidRole));
    }
    return NextResponse.next();
  }

  // ── 5. Protected dashboard routes — must be signed in ────────────────────
  const isProtected =
    pathname.startsWith("/student/") ||
    pathname.startsWith("/lecturer/") ||
    pathname.startsWith("/institution/");

  if (isProtected) {
    const session = await getSession(req);
    if (!session?.user) {
      return redirect(req, `/signin`);
    }

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
