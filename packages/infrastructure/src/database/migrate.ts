import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../env';
import * as schema from './schema';

// Resolved from this file's location, so `pnpm migrate` works whether the
// cwd is the package dir or the repo root (via `pnpm --filter`).
const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

const runMigration = async () => {
  // Migration connection is local here; runtime connections live in ./connection.ts.
  const client = postgres(env.DATABASE_URL);
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder });
  await client.end();
};

await runMigration();
