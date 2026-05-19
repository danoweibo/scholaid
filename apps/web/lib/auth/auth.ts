import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient: AuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:5000",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include", // sends cookie cross-origin to backboard.scholaid.co
  },
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
