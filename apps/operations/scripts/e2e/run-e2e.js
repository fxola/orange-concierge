// run-e2e.js

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTestEnvironment } from './config.js';
import { runCommand, runRequired, stopActiveProcess } from './process.js';
import { startPostgres } from './postgres-test-container.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const paths = {
  app: path.resolve(scriptDir, '../..'),
  repo: path.resolve(scriptDir, '../../../..'),
};

const nextManagedFiles = [
  path.join(paths.app, 'next-env.d.ts'),
  path.join(paths.app, 'tsconfig.json'),
];

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

async function snapshotFiles(filePaths) {
  const snapshots = await Promise.all(
    filePaths.map(async (filePath) => ({
      filePath,
      content: await readFile(filePath, 'utf8'),
    }))
  );

  let restored = false;

  return async function restoreFiles() {
    if (restored) {
      return;
    }

    restored = true;

    await Promise.all(
      snapshots.map((snapshot) => writeFile(snapshot.filePath, snapshot.content, 'utf8'))
    );
  };
}

function registerShutdown(postgres, restoreNextManagedFiles) {
  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    stopActiveProcess(signal);

    try {
      await restoreNextManagedFiles();
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
  const restoreNextManagedFiles = await snapshotFiles(nextManagedFiles);
  registerShutdown(postgres, restoreNextManagedFiles);

  try {
    const env = createTestEnvironment(postgres.databaseUrl);

    await migrateDatabase(env);
    await seedDatabase(env);

    process.exitCode = await runTests(env);
  } finally {
    await restoreNextManagedFiles();
    await postgres.stop();
  }
}

main().catch((error) => {
  console.error('[e2e] Failed:', error);
  process.exitCode = 1;
});
