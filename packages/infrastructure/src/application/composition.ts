import { randomUUID } from 'node:crypto';

import { GetClient, ListClients, SubmitInteraction } from '@orange-concierge/core';

import { DrizzleTransactionManager } from '../adapters/interaction/drizzle-transaction-manager';
import { createAuth } from '../auth';
import { createDatabaseFromUrl } from '../database/connection';
import { createBackendConfigFromEnvironment, type BackendConfig } from './config';
import type { Application } from './types';
import { DrizzleClientRepository } from '../adapters/client/drizzle-client-repository';

type ApplicationRuntime = Readonly<{
  application: Application;
  close: () => Promise<void>;
}>;

declare global {
  var __orangeConciergeApplicationRuntime: ApplicationRuntime | undefined;
}

/**
 * Compose the concrete backend runtime from explicit configuration.
 *
 * The returned runtime owns infrastructure lifecycle, while its public
 * `application` facade exposes only application capabilities.
 */
const createApplicationRuntime = (config: BackendConfig): ApplicationRuntime => {
  const { databaseUrl, baseUrl: baseURL, authSecret: secret, trustedOrigins } = config;

  const { db, client } = createDatabaseFromUrl(databaseUrl);

  const auth = createAuth({ db, baseURL, secret, trustedOrigins });

  const transactionManager = new DrizzleTransactionManager(db);
  const clientRepository = new DrizzleClientRepository(db);

  const submitInteractionUseCase = new SubmitInteraction({
    transactionManager,
    clientRepository,
    newInteractionId: randomUUID,
    now: () => new Date(),
  });
  const listClientsUseCase = new ListClients({ clientRepository });
  const getClientUseCase = new GetClient({ clientRepository });

  const application: Application = {
    auth,
    interaction: {
      submit: (input) => submitInteractionUseCase.execute(input),
    },
    client: {
      getAll: (input) => listClientsUseCase.execute(input),
      getOne: (input) => getClientUseCase.execute(input),
    },
  };

  return {
    application,
    close: () => client.end(),
  };
};

/**
 * Process-level application singleton.
 *
 * Keeping the runtime on `globalThis` prevents duplicate database pools during
 * Next.js development/HMR. In production this results in one composed backend
 * runtime per Node.js process.
 *
 * `postgres()` connects lazily, so constructing the application does not open
 * a database socket until the first query.
 */
export const getApplication = (): Application => {
  const existing = globalThis.__orangeConciergeApplicationRuntime;

  if (existing) {
    return existing.application;
  }

  const runtime = createApplicationRuntime(createBackendConfigFromEnvironment());

  globalThis.__orangeConciergeApplicationRuntime = runtime;

  return runtime.application;
};

/**
 * Test-only lifecycle seam.
 *
 * Intentionally not re-exported from the package root. Infrastructure tests
 * may import this module directly/relatively when they need to reset the
 * process singleton between test cases.
 */
export const resetApplicationForTests = async (): Promise<void> => {
  const runtime = globalThis.__orangeConciergeApplicationRuntime;

  globalThis.__orangeConciergeApplicationRuntime = undefined;

  if (runtime) {
    await runtime.close();
  }
};
