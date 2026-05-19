import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient: AuthClient = createAuthClient({
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
