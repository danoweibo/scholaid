"use client";

import {
  authClient,
  useSession as useBetterAuthSession,
} from "@/lib/auth/auth";
import type {
  ScholaidRole,
  ScholaidUser,
  SignOutOptions,
} from "@/lib/auth/types";

/**
 * Typed session hook for Scholaid.
 *
 * Wraps better-auth's useSession() and casts the user to ScholaidUser
 * so you get full type safety on scholaidRole, institutionName etc.
 * without manual casting in every component.
 *
 * Usage:
 *   const { user, session, isPending, isAuthenticated } = useScholaidSession();
 *
 *   if (isPending) return <Spinner />;
 *   if (!isAuthenticated) redirect('/sign-in');
 *
 *   // Fully typed — no `as` needed
 *   if (user.scholaidRole === 'student') { ... }
 */
export function useScholaidSession() {
  const { data, isPending, error, refetch } = useBetterAuthSession();

  const user = data?.user as ScholaidUser | undefined;
  const session = data?.session;

  return {
    user,
    session,
    isPending,
    error,
    refetch,
    isAuthenticated: !!user,
    isStudent: user?.scholaidRole === "student",
    isLecturer: user?.scholaidRole === "lecturer",
    isInstitution: user?.scholaidRole === "institution",
    isStandardStudent:
      user?.scholaidRole === "student" &&
      // `studentType` would need to be fetched separately from /users/me
      // since better-auth doesn't store it on the session.
      // Use this as a convenience flag once you fetch and cache the student profile.
      false,
    scholaidRole: user?.scholaidRole as ScholaidRole | undefined,
  };
}

export async function signOut(options?: SignOutOptions): Promise<void> {
  const { router, redirectTo, onSuccess } = options ?? {};

  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        onSuccess?.();

        if (router && redirectTo) {
          router.push(redirectTo);
        }
      },
    },
  });
}
