import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

const runMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  // Migration connection is local here; runtime connections live in ./connection.ts.
  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder: './drizzle' });
  await client.end();
};

await runMigration();
