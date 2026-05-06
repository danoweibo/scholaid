import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

type AuthClient = ReturnType<typeof createAuthClient>;

export const authClient: AuthClient = createAuthClient({
  baseURL: "http://localhost:5000",
  plugins: [adminClient()],
});
