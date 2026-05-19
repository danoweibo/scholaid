import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient: AuthClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://scholaid.local:7000",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
