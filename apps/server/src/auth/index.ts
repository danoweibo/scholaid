import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin } from "better-auth/plugins";
import { db } from "@/db/index.js";
import * as schema from "@/db/schema.js";
import { createUserProfileHook } from "./hooks/create-user-profile.hook.js";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL,
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
    cookieCache: { enabled: false },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    disableCsrfCheck: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN ?? "localhost",
    },
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

  trustedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  emailAndPassword: { enabled: true },

  plugins: [openAPI(), admin({ defaultRole: "user", adminRoles: ["admin"] })],
});

export type Auth = typeof auth;
