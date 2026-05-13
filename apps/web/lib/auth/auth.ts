import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * The better-auth client for Scholaid's Next.js frontend.
 *
 * Points at the NestJS server's better-auth handler at /api/auth.
 * All auth methods (signIn, signUp, signOut, useSession, etc.) come from here.
 *
 * Usage:
 *   import { authClient } from '@/lib/auth-client';
 *
 *   // Sign up
 *   await authClient.signUp.email({ name, email, password, scholaidRole });
 *
 *   // Sign in
 *   await authClient.signIn.email({ email, password });
 *
 *   // Sign out
 *   await authClient.signOut();
 *
 *   // Get session (React hook)
 *   const { data: session, isPending } = authClient.useSession();
 *
 *   // Get session (server component / server action)
 *   const session = await authClient.getSession();
 */
type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient: AuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include", // 👈 sends cookies cross-origin
  },
  plugins: [
    // Enables admin API methods on the client:
    // authClient.admin.setRole(), authClient.admin.banUser(), etc.
    adminClient(),
  ],
});

// Re-export the typed session hook and common methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
