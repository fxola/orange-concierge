/**
 * Backend environment configuration.
 *
 * Single centralized parser for everything concrete backend composition
 * needs.
 *
 * Lives in infrastructure so the dependency direction remains:
 *
 *   apps/operations → infrastructure → core
 *
 * Must not import `server-only`: this module also runs under `tsx`
 * (seed/migrate scripts), where `server-only` throws.
 *
 * Behavior:
 * - missing values fall back to local-development defaults
 * - provided URLs are validated
 * - explicitly exported environment variables win over `.env` files
 *   (see `../env.ts`)
 */
export type BackendConfig = Readonly<{
  databaseUrl: string;
  baseUrl: string;
  authSecret?: string;
  trustedOrigins?: string[];
}>;

const DEFAULT_DATABASE_URL = 'postgresql://concierge:concierge@localhost:5433/concierge';

const DEFAULT_BASE_URL = 'http://localhost:3000';

export function createBackendConfigFromEnvironment(
  env: NodeJS.ProcessEnv = process.env
): BackendConfig {
  return {
    databaseUrl: resolveDatabaseUrl(env),
    baseUrl: resolveBaseUrl(env),
    authSecret: resolveAuthSecret(env),
    trustedOrigins: resolveTrustedOrigins(env),
  };
}

function resolveDatabaseUrl(env: NodeJS.ProcessEnv): string {
  return readEnvironmentVariable(env, 'DATABASE_URL') ?? DEFAULT_DATABASE_URL;
}

function resolveBaseUrl(env: NodeJS.ProcessEnv): string {
  const baseUrl =
    readEnvironmentVariable(env, 'BETTER_AUTH_URL') ??
    readEnvironmentVariable(env, 'NEXT_PUBLIC_APP_URL');

  if (!baseUrl) {
    return DEFAULT_BASE_URL;
  }

  return validateHttpUrl('Application base URL', baseUrl);
}

function resolveAuthSecret(env: NodeJS.ProcessEnv): string | undefined {
  return (
    readSecretEnvironmentVariable(env, 'BETTER_AUTH_SECRET') ??
    readSecretEnvironmentVariable(env, 'AUTH_SECRET')
  );
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

  return url.toString().replace(/\/+$/, '');
}

function readEnvironmentVariable(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name]?.trim();

  return value || undefined;
}

/**
 * Secrets are checked for blank/whitespace-only values without modifying
 * the actual secret.
 */
function readSecretEnvironmentVariable(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name];

  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value;
}
