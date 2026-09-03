import { pathToFileURL } from 'node:url';
import { seed } from '@orange-concierge/infrastructure';
import { createAppConfigFromEnvironment } from './config';

function assertSeedEnvironment(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seed data cannot be applied when NODE_ENV=production.');
  }

  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo seeding is disabled. Set ALLOW_DEMO_SEED=true to enable it.');
  }
}

export async function runSeed(): Promise<void> {
  assertSeedEnvironment();

  const config = createAppConfigFromEnvironment();

  await seed({
    databaseUrl: config.databaseUrl,
    baseUrl: config.baseUrl,
    authSecret: config.authSecret,
    trustedOrigins: config.trustedOrigins,
    users: config.seedUsers,
  });
}

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  runSeed().catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  });
}
