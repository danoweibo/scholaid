"use client";

import { useAuthStore } from "@/lib/auth/store";
import { authClient } from "@/lib/auth/auth";
import type { ScholaidRole, SignOutOptions } from "@/lib/auth/types";

/**
 * Primary session hook for Scholaid.
 *
 * Reads from the Zustand cache — instant, no network call.
 * The cache is populated by setUser() after sign-in / sign-up.
 *
 * For server components or cases where you need to verify the session
 * is still valid server-side, use getSession() from auth.ts instead.
 */
export function useScholaidSession() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAuthenticated: !!user,
    isStudent: user?.scholaidRole === "student",
    isLecturer: user?.scholaidRole === "lecturer",
    isInstitution: user?.scholaidRole === "institution",
    scholaidRole: user?.scholaidRole as ScholaidRole | undefined,
  };
}

/**
 * Signs the user out.
 * Clears the Zustand cache immediately so the UI reacts at once,
 * then calls better-auth to clear the server-side session and cookie.
 */
export async function signOut(options?: SignOutOptions): Promise<void> {
  const { router, redirectTo, onSuccess } = options ?? {};

  // Clear local cache first — UI updates immediately
  useAuthStore.getState().clearAuth();

  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        onSuccess?.();
        if (router && redirectTo) router.push(redirectTo);
      },
    },
  });
}
