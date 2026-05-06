import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, admin } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';

/**
 * Core better-auth instance for Scholaid.
 *
 * Auth routes are mounted at /api/auth/* by the @thallesp/nestjs-better-auth
 * module, which reads `basePath` from this config automatically.
 *
 * Plugins:
 *  - openAPI  → Scalar UI at  GET /api/auth/reference
 *              JSON schema at  GET /api/auth/open-api/generate-schema
 *  - admin    → System-operator (developer) role management.
 *               Grants access to user/session management endpoints.
 *               Use @Roles(['admin']) on NestJS controllers to protect routes.
 *
 * CORS:
 *  trustedOrigins is picked up by the nestjs wrapper and applied to all
 *  /api/auth/* routes automatically on Fastify (since app-level @fastify/cors
 *  does not cover middleware-mounted routes).
 */
export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  hooks: {},

  trustedOrigins: [
    'http://scholaid.local:5000',
    'http://localhost:3000',
    'http://localhost:5000',
  ],

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: 'common',
    },
  },

  plugins: [openAPI(), admin()],
});

export type Auth = typeof auth;
