import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Load the package-local `.env` file (`packages/<name>/.env`) into
 * `process.env` using Node's native loader.
 *
 * Explicitly exported variables always win: `process.loadEnvFile()` never
 * overrides existing entries. Missing file is not an error (CI/production
 * inject env directly).
 *
 * Call this at the top of script entry-points (`migrate.ts`, `seed.ts`,
 * `drizzle.config.ts`) — `tsx` and `drizzle-kit` do not load `.env` files
 * on their own. Next.js runtime loads env itself; this is only for scripts.
 */
export function loadPackageEnv(packageDir: string): void {
  const envFile = path.join(packageDir, '.env');

  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
}

/** Resolve the package root from a module URL, e.g. `src/database/` → 2 levels up. */
export function packageRootFrom(moduleUrl: string, levelsUp: number): string {
  let dir = path.dirname(fileURLToPath(moduleUrl));

  for (let i = 0; i < levelsUp; i++) {
    dir = path.dirname(dir);
  }

  return dir;
}
