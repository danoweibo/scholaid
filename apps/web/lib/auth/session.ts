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
