import { authClient } from "@/lib/auth/client";
import type { SignOutOptions } from "@/types/auth";

const { useSession } = authClient;

export function useUserSession() {
  const { data: session, isPending, error, refetch } = useSession();

  /* Function Definitions
   * isPending: handles the loading state.
   * error: provides the error object.
   * refetch: refetches the session.
   */

  return {
    session,
    isPending,
    error,
    refetch,
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
