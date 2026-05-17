// @/lib/auth/session.ts
"use client";

import { useAuthStore } from "@/lib/auth/store";
import { authClient } from "@/lib/auth/auth";
import type { ScholaidRole, SignOutOptions } from "@/lib/auth/types";

export function useScholaidSession() {
  const { user, token } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated: !!user,
    isStudent: user?.scholaidRole === "student",
    isLecturer: user?.scholaidRole === "lecturer",
    isInstitution: user?.scholaidRole === "institution",
    scholaidRole: user?.scholaidRole as ScholaidRole | undefined,
  };
}

export async function signOut(options?: SignOutOptions): Promise<void> {
  const { router, redirectTo, onSuccess } = options ?? {};

  // clearAuth now handles both the Zustand store and the bare localStorage
  // "scholaid_token" key, so authClient stops sending a Bearer token
  // immediately even before the server round-trip completes.
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
