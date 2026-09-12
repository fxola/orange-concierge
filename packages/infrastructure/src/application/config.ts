import type { AIConfig } from '@orange-concierge/ai';
import { env } from '../env';

export const config = {
  general: {
    baseUrl: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL,
  },
  db: {
    url: env.DATABASE_URL,
  },
  auth: {
    secret: env.BETTER_AUTH_SECRET ?? env.AUTH_SECRET,
    trustedOrigins: (env.BETTER_AUTH_TRUSTED_ORIGINS ?? env.TRUSTED_ORIGINS)
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  ai: createAIConfig(),
};

export type BackendConfig = typeof config;

function createAIConfig(): AIConfig {
  const provider = env.AI_PROVIDER;

  if (provider === 'gemini') {
    return {
      provider,
      apiKey: env.AI_API_KEY ?? '',
      model: env.AI_MODEL ?? 'gemini-1.5-flash',
      baseUrl: env.AI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta',
      timeoutMs: env.AI_TIMEOUT_MS,
    };
  }

  return {
    provider,
    model: env.AI_MODEL ?? 'llama3.2',
    baseUrl: env.AI_BASE_URL ?? 'http://localhost:11434',
    timeoutMs: env.AI_TIMEOUT_MS,
  };
}
