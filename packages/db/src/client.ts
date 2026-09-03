import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Sql } from 'postgres';
import type * as schema from './schema';

export type OrangeConciergeSchema = typeof schema;
export type OrangeConciergeDB = PostgresJsDatabase<OrangeConciergeSchema>;
export type PostgresClient = Sql;
