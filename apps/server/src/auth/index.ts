import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin } from "better-auth/plugins";
import { db } from "@/db/index.js";
import * as schema from "@/db/schema.js";
import { createUserProfileHook } from "./hooks/create-user-profile.hook.js";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: {
    allowedHosts: [
      "backboard.scholaid.co",
      "scholaid.co",
      "www.scholaid.co",
      "localhost:5000",
      "scholaid.local:7000",
    ],
    protocol: process.env.NODE_ENV === "production" ? "https" : "http",
    fallback: "https://backboard.scholaid.co",
  },

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

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    disableCsrfCheck: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: ".scholaid.co", // explicit shared parent domain
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

  emailAndPassword: { enabled: true },

  plugins: [openAPI(), admin({ defaultRole: "user", adminRoles: ["admin"] })],
});

export type Auth = typeof auth;
