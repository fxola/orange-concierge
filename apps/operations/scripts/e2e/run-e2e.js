// run-e2e.js

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTestEnvironment } from './config.js';
import { runCommand, runRequired, stopActiveProcess } from './process.js';
import { startPostgres } from './postgres-test-container.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const paths = {
  app: path.resolve(scriptDir, '../..'),
  repo: path.resolve(scriptDir, '../../..'),
};

const args = process.argv.slice(2);
const playwrightArgs = args[0] === '--' ? args.slice(1) : args;

function executable(name) {
  return process.platform === 'win32' ? `${name}.cmd` : name;
}

const pnpm = executable('pnpm');
const playwright = executable('playwright');

async function migrateDatabase(env) {
  console.log('[e2e] Running database migrations...');
  await runRequired(pnpm, ['--filter', '@orange-concierge/infrastructure', 'migrate'], {
    cwd: paths.repo,
    env,
  });
}

async function seedDatabase(env) {
  console.log('[e2e] Running demo seed...');
  await runRequired(pnpm, ['--filter', '@orange-concierge/infrastructure', 'seed'], {
    cwd: paths.repo,
    env,
  });
}

async function runTests(env) {
  console.log('[e2e] Running Playwright...');
  return runCommand(playwright, ['test', ...playwrightArgs], {
    cwd: paths.app,
    env,
  });
}

function registerShutdown(postgres) {
  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    stopActiveProcess(signal);

    try {
      await postgres.stop();
    } finally {
      process.exit(signal === 'SIGINT' ? 130 : 143);
    }
  }

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

async function main() {
  const postgres = await startPostgres();
  registerShutdown(postgres);

  try {
    const env = createTestEnvironment(postgres.databaseUrl);

    await migrateDatabase(env);
    await seedDatabase(env);

    process.exitCode = await runTests(env);
  } finally {
    await postgres.stop();
  }
}

main().catch((error) => {
  console.error('[e2e] Failed:', error);
  process.exitCode = 1;
});
