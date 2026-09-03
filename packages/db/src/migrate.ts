import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDatabaseFromUrl } from './client';

const runMigration = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run migrations');
  }

  const { db, client } = createDatabaseFromUrl(databaseUrl);

  await migrate(db, { migrationsFolder: './drizzle' });
  await client.end();
};

await runMigration();
