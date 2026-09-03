import 'server-only';

export type SeedUserConfig = Readonly<{
  email: string;
  name: string;
  password: string;
}>;

export type AppConfig = Readonly<{
  databaseUrl: string;
  baseUrl: string;
  authSecret?: string;
  trustedOrigins?: string[];
  seedUsers: Readonly<{
    admin: SeedUserConfig;
    consultant: SeedUserConfig;
    reviewer: SeedUserConfig;
  }>;
}>;

const DEFAULT_DATABASE_URL = 'postgresql://concierge:concierge@localhost:5433/concierge';
const DEFAULT_BASE_URL = 'http://localhost:3000';

export function createAppConfigFromEnvironment(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    databaseUrl: resolveDatabaseUrl(env),
    baseUrl: resolveBaseUrl(env),
    authSecret: resolveAuthSecret(env),
    trustedOrigins: resolveTrustedOrigins(env),
    seedUsers: resolveSeedUsers(env),
  };
}

function resolveDatabaseUrl(env: NodeJS.ProcessEnv): string {
  const databaseUrl = readEnvironmentVariable(env, 'DATABASE_URL');

  if (databaseUrl) {
    return databaseUrl;
  }

  return DEFAULT_DATABASE_URL;
}

function resolveBaseUrl(env: NodeJS.ProcessEnv): string {
  const baseUrl =
    readEnvironmentVariable(env, 'BETTER_AUTH_URL') ??
    readEnvironmentVariable(env, 'NEXT_PUBLIC_APP_URL');

  if (baseUrl) {
    return validateHttpUrl('Application base URL', baseUrl);
  }

  return DEFAULT_BASE_URL;
}

function resolveAuthSecret(env: NodeJS.ProcessEnv): string | undefined {
  const authSecret =
    readSecretEnvironmentVariable(env, 'BETTER_AUTH_SECRET') ??
    readSecretEnvironmentVariable(env, 'AUTH_SECRET');

  if (authSecret) {
    return authSecret;
  }

  return undefined;
}

function resolveTrustedOrigins(env: NodeJS.ProcessEnv): string[] | undefined {
  const value =
    readEnvironmentVariable(env, 'BETTER_AUTH_TRUSTED_ORIGINS') ??
    readEnvironmentVariable(env, 'TRUSTED_ORIGINS');

  if (!value) {
    return undefined;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => validateHttpUrl('Trusted origin', origin));

  if (origins.length === 0) {
    return undefined;
  }

  return [...new Set(origins)];
}

function validateHttpUrl(name: string, value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not a valid URL: "${value}".`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use the http or https protocol: "${value}".`);
  }

  return url.toString().replace(/\/$/, '');
}

function readEnvironmentVariable(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name]?.trim();
  return value || '';
}

function readSecretEnvironmentVariable(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name];
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value;
}

function resolveSeedUsers(env: NodeJS.ProcessEnv): AppConfig['seedUsers'] {
  return {
    admin: {
      email: readEnvironmentVariable(env, 'SEED_ADMIN_EMAIL'),
      name: readEnvironmentVariable(env, 'SEED_ADMIN_NAME'),
      password: readSecretEnvironmentVariable(env, 'SEED_ADMIN_PASSWORD'),
    },
    consultant: {
      email: readEnvironmentVariable(env, 'SEED_CONSULTANT_EMAIL'),
      name: readEnvironmentVariable(env, 'SEED_CONSULTANT_NAME'),
      password: readSecretEnvironmentVariable(env, 'SEED_CONSULTANT_PASSWORD'),
    },
    reviewer: {
      email: readEnvironmentVariable(env, 'SEED_REVIEWER_EMAIL'),
      name: readEnvironmentVariable(env, 'SEED_REVIEWER_NAME'),
      password: readSecretEnvironmentVariable(env, 'SEED_REVIEWER_PASSWORD'),
    },
  };
}
