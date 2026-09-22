export const postgresConfig = {
  user: 'e2e-o-concierge',
  password: 'e2e-o-concierge',
  database: 'e2e-o-concierge',
  port: 5432,
  image: 'pgvector/pgvector:pg16',
};

export const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3100';

export function createTestEnvironment(databaseUrl) {
  return {
    ...process.env,

    DATABASE_URL: databaseUrl,

    POSTGRES_USER: postgresConfig.user,
    POSTGRES_PASSWORD: postgresConfig.password,
    POSTGRES_DB: postgresConfig.database,

    NODE_ENV: 'development',

    NEXT_PUBLIC_APP_URL: baseUrl,
    BETTER_AUTH_URL: baseUrl,

    AUTH_SECRET: 'e2e-auth-secret-1234567890abcdef',
    BETTER_AUTH_SECRET: 'e2e-better-auth-secret-1234567890abcdef',

    ALLOW_DEMO_SEED: 'true',

    SEED_ADMIN_EMAIL: 'admin@orangeconcierge.test',
    SEED_ADMIN_NAME: 'Test Admin',
    SEED_ADMIN_PASSWORD: 'DemoAdmin123!',

    SEED_CONSULTANT_EMAIL: 'consultant@orangeconcierge.test',
    SEED_CONSULTANT_NAME: 'Test Consultant',
    SEED_CONSULTANT_PASSWORD: 'DemoConsultant123!',

    SEED_REVIEWER_EMAIL: 'reviewer@orangeconcierge.test',
    SEED_REVIEWER_NAME: 'Test Reviewer',
    SEED_REVIEWER_PASSWORD: 'DemoReviewer123!',
  };
}
