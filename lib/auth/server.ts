import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin } from "better-auth/plugins";
import { createUserProfileHook } from "@/lib/auth/hooks/create-user-profile";
import { sendVerificationEmail } from "@/lib/mail";
import { db } from "@/database";
import * as schema from "@/database/schema";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL || "http://scholaid.local:7000",
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  user: {
    additionalFields: {
      scholaidRole: {
        type: "string" as const,
        required: true,
        input: true,
        defaultValue: "student",
      },
      institutionName: {
        type: "string" as const,
        required: false,
        input: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },

  databaseHooks: {
    user: {
      create: {
        after: createUserProfileHook as (
          user: Record<string, unknown>,
        ) => Promise<void>,
      },
    },
  },

  // ── Email & password ────────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // 🔒 blocks sign-in until email is verified
  },

  // ── Email verification ───────────────────────────────────────────────────────
  emailVerification: {
    sendOnSignUp: true, // fire immediately on registration
    autoSignInAfterVerification: true, // log the user in once they click the link
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, name: user.name, url });
    },
  },

  plugins: [openAPI(), admin({ defaultRole: "user", adminRoles: ["admin"] })],
});

export type Auth = typeof auth;
