import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';

export type OrangeConciergeSchema = typeof schema;
export type OrangeConciergeDB = PostgresJsDatabase<OrangeConciergeSchema>;
export type PostgresClient = Sql;

export const createDatabaseFromUrl = (
  databaseUrl: string
): Readonly<{ db: OrangeConciergeDB; client: PostgresClient }> => {
  const client: PostgresClient = postgres(databaseUrl);
  const db = drizzle(client, { schema });
  return { db, client };
};
