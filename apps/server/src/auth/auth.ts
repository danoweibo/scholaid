import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, admin } from 'better-auth/plugins';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { createUserProfileHook } from './hooks/create-user-profile.hook';

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
      role: {
        type: 'string',
        required: true,
        input: true, // allows it to be passed in the sign-up body
      },
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
