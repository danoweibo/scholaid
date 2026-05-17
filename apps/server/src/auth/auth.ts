/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, admin } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { createUserProfileHook } from '@/auth/hooks/create-user-profile.hook';

export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  user: {
    additionalFields: {
      // `scholaidRole` differentiates student / lecturer / institution.
      // Named differently from `role` to avoid collision with the admin
      // plugin which owns the `role` field on the user table.
      scholaidRole: {
        type: 'string' as const,
        required: true,
        input: true,
        defaultValue: 'student',
      },
      // Only used when scholaidRole === 'institution'
      institutionName: {
        type: 'string' as const,
        required: false,
        input: true,
      },
    },
  },

  advanced: {
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: '.scholaid.co',
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

  // trustedOrigins controls CORS for ALL routes — the nestjs-better-auth
  // wrapper registers @fastify/cors globally using this list.
  // Do NOT call app.enableCors() alongside this — it double-registers the plugin.
  trustedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://scholaid.local:7000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },

  plugins: [
    openAPI(),
    // The admin plugin manages the `role` field on the user table.
    // `defaultRole` is what every new signup gets.
    // `adminRoles` are the roles that can access admin endpoints —
    // set a user's role to 'admin' via POST /api/auth/admin/set-role
    // to grant system-operator access (developer / you).
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
});

export type Auth = typeof auth;
