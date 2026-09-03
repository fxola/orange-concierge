import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@orange-concierge/db';
import type { OrangeConciergeDB, PostgresClient } from '@orange-concierge/db';

export type { OrangeConciergeDB, PostgresClient };

export const createDatabaseFromUrl = (
  databaseUrl: string
): Readonly<{ db: OrangeConciergeDB; client: PostgresClient }> => {
  const client: PostgresClient = postgres(databaseUrl);
  const db = drizzle(client, { schema });
  return { db, client };
};
