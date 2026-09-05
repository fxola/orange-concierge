import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { loadPackageEnv, packageRootFrom } from '../env';
import * as schema from './schema';

loadPackageEnv(packageRootFrom(import.meta.url, 2));

// Resolved from this file's location, so `pnpm migrate` works whether the
// cwd is the package dir or the repo root (via `pnpm --filter`).
const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

const runMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  // Migration connection is local here; runtime connections live in ./connection.ts.
  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder });
  await client.end();
};

await runMigration();
