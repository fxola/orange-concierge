import { defineConfig } from 'drizzle-kit';
import { loadPackageEnv, packageRootFrom } from './src/env';

loadPackageEnv(packageRootFrom(import.meta.url, 0));

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './src/database/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://concierge:concierge@localhost:5433/concierge',
  },
});
