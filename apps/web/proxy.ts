import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware for Scholaid.
 *
 * Public routes — accessible without a session:
 *   /sign-in, /sign-up, /invites/accept/:token
 *
 * Protected routes — redirect to /sign-in if no session cookie:
 *   everything else
 *
 * Role-specific redirects — handled inside page components using
 * useScholaidSession(), not here. Middleware only checks authentication,
 * not authorization, to keep it fast (no DB calls).
 *
 * How it works:
 *   better-auth sets a session cookie on sign-in. This middleware checks
 *   for that cookie's presence — it does NOT validate it cryptographically
 *   (that would require a server roundtrip). The server validates the session
 *   on every API call, so an invalid/expired cookie just means the API
 *   returns 401 and the page redirects to sign-in anyway.
 */

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/invites/accept",
  "/_next",
  "/favicon.ico",
  "/api", // Next.js API routes if any
];

const SESSION_COOKIE_NAME = "better-auth.session_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  // Check for session cookie
  const sessionCookie =
    request.cookies.get(SESSION_COOKIE_NAME) ??
    request.cookies.get("__Secure-better-auth.session_token"); // HTTPS variant

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    // Preserve the originally requested path so we can redirect back after sign-in
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
