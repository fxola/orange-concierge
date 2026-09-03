import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { account, session, user, verification, type OrangeConciergeDB } from '@orange-concierge/db';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export type CreateAuthInput = Readonly<{
  db: OrangeConciergeDB;
  baseURL?: string;
  secret?: string;
  trustedOrigins?: string[];
  disableSignUp?: boolean;
}>;

const authSchema = {
  user,
  session,
  account,
  verification,
};

export const createAuth = (input: CreateAuthInput) =>
  betterAuth({
    appName: 'Orange Concierge',
    baseURL: input.baseURL,
    secret: input.secret,
    trustedOrigins: input.trustedOrigins,
    database: drizzleAdapter(input.db, {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: input.disableSignUp ?? true,
    },
    session: {
      storeSessionInDatabase: true,
    },
    user: {
      additionalFields: {
        role: {
          type: ['admin', 'consultant', 'reviewer'],
          required: true,
          defaultValue: 'consultant',
          input: false,
          returned: true,
        },
      },
    },
    plugins: [nextCookies()],
  });

export type OrangeConciergeAuth = ReturnType<typeof createAuth>;
