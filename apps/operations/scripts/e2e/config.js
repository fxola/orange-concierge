export const postgresConfig = {
  user: 'e2e-o-concierge',
  password: 'e2e-o-concierge',
  database: 'e2e-o-concierge',
  port: 5432,
  image: 'pgvector/pgvector:pg16',
};

export const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3100';
export const seedUsers = {
  admin: {
    email: 'admin@orangeconcierge.test',
    name: 'Test Admin',
    password: 'DemoAdmin123!',
  },

  consultant: {
    email: 'consultant@orangeconcierge.test',
    name: 'Test Consultant',
    password: 'DemoConsultant123!',
  },

  reviewer: {
    email: 'reviewer@orangeconcierge.test',
    name: 'Test Reviewer',
    password: 'DemoReviewer123!',
  },
};

export function getE2EAppConfig() {
  const url = new URL(baseURL);

  return {
    baseURL,
    host: url.hostname === 'localhost' ? '127.0.0.1' : url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
  };
}

export function createTestEnvironment(databaseUrl) {
  return {
    ...process.env,

    DATABASE_URL: databaseUrl,

    POSTGRES_USER: postgresConfig.user,
    POSTGRES_PASSWORD: postgresConfig.password,
    POSTGRES_DB: postgresConfig.database,

    NODE_ENV: 'development',
    NEXT_DIST_DIR: '.next-e2e',

    NEXT_PUBLIC_APP_URL: baseURL,
    BETTER_AUTH_URL: baseURL,

    AUTH_SECRET: 'e2e-auth-secret-1234567890abcdef',
    BETTER_AUTH_SECRET: 'e2e-better-auth-secret-1234567890abcdef',

    ALLOW_DEMO_SEED: 'true',

    SEED_ADMIN_EMAIL: seedUsers.admin.email,
    SEED_ADMIN_NAME: seedUsers.admin.name,
    SEED_ADMIN_PASSWORD: seedUsers.admin.password,

    SEED_CONSULTANT_EMAIL: seedUsers.consultant.email,
    SEED_CONSULTANT_NAME: seedUsers.consultant.name,
    SEED_CONSULTANT_PASSWORD: seedUsers.consultant.password,

    SEED_REVIEWER_EMAIL: seedUsers.reviewer.email,
    SEED_REVIEWER_NAME: seedUsers.reviewer.name,
    SEED_REVIEWER_PASSWORD: seedUsers.reviewer.password,
  };
}
