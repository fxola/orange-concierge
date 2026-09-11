import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const rootEnvFile = path.join(repoRoot, '.env');

if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

export const env = createEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
    NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  },
  server: {
    DATABASE_URL: z.string().default('postgresql://concierge:concierge@localhost:5433/concierge'),

    BETTER_AUTH_URL: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
    TRUSTED_ORIGINS: z.string().optional(),

    AI_PROVIDER: z.string().default('ollama'),
    AI_MODEL: z.string().optional(),
    AI_BASE_URL: z.string().optional(),
    AI_API_KEY: z.string().optional(),
    AI_TIMEOUT_MS: z.coerce.number().optional(),

    NODE_ENV: z.string().optional(),
    ALLOW_DEMO_SEED: z.string().optional(),
    SEED_ADMIN_EMAIL: z.string().optional(),
    SEED_ADMIN_NAME: z.string().optional(),
    SEED_ADMIN_PASSWORD: z.string().optional(),
    SEED_CONSULTANT_EMAIL: z.string().optional(),
    SEED_CONSULTANT_NAME: z.string().optional(),
    SEED_CONSULTANT_PASSWORD: z.string().optional(),
    SEED_REVIEWER_EMAIL: z.string().optional(),
    SEED_REVIEWER_NAME: z.string().optional(),
    SEED_REVIEWER_PASSWORD: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
