import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema';

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
