import { randomUUID } from 'node:crypto';

import {
  AnalyzeInteraction,
  GetClient,
  ListClients,
  SubmitInteraction,
} from '@orange-concierge/core';
import { PatternSecretScanner } from '@orange-concierge/security';

import { DrizzleAuditPort } from '../adapters/audit/drizzle-audit-port';
import { DrizzleTransactionManager } from '../adapters/interaction/drizzle-transaction-manager';
import { DrizzleInteractionRepository } from '../adapters/interaction/drizzle-interaction-repository';
import { UnavailableStructuredLLM } from '../adapters/interaction/unavailable-structured-llm';
import { createAuth } from '../auth';
import { createDatabaseFromUrl, OrangeConciergeDB } from '../database/connection';
import { createBackendConfigFromEnvironment, type BackendConfig } from './config';
import type { Application } from './types';
import { DrizzleClientRepository } from '../adapters/client/drizzle-client-repository';

type ApplicationRuntime = Readonly<{
  application: Application;
  close: () => Promise<void>;
}>;

declare global {
  var __appRuntime: ApplicationRuntime | undefined;
}

const createApplicationRuntime = (config: BackendConfig): ApplicationRuntime => {
  const { databaseUrl, baseUrl: baseURL, authSecret: secret, trustedOrigins } = config;
  const { db, client } = createDatabaseFromUrl(databaseUrl);

  const clientRepository = new DrizzleClientRepository(db);
  const transactionManager = new DrizzleTransactionManager(db);

  const auth = createAuth({ db, baseURL, secret, trustedOrigins });
  const interaction = buildInteraction(db, transactionManager, clientRepository);
  const clients = buildClients(clientRepository);

  const application: Application = {
    auth,
    interaction,
    clients,
  };

  return {
    application,
    close: () => client.end(),
  };
};

const buildInteraction = (
  db: OrangeConciergeDB,
  transactionManager: DrizzleTransactionManager,
  clientRepository: DrizzleClientRepository
): Application['interaction'] => {
  const submitInteractionUseCase = new SubmitInteraction({
    transactionManager,
    clientRepository,
    newInteractionId: randomUUID,
    now: () => new Date(),
  });

  const audit = new DrizzleAuditPort(db);
  const interactionRepository = new DrizzleInteractionRepository(db);
  const secretScanner = new PatternSecretScanner();
  const structuredLLM = new UnavailableStructuredLLM();
  const analyzeInteractionUseCase = new AnalyzeInteraction({
    interactionsRepo: interactionRepository,
    secretScanner,
    structuredLLM,
    audit,
    transactionManager,
    now: () => new Date(),
  });

  return {
    submit: (input) => submitInteractionUseCase.execute(input),
    analyze: (input) => analyzeInteractionUseCase.execute(input),
  };
};

const buildClients = (clientRepository: DrizzleClientRepository): Application['clients'] => {
  const listClientsUseCase = new ListClients({ clientRepository });
  const getClientUseCase = new GetClient({ clientRepository });
  return {
    getAll: (input) => listClientsUseCase.execute(input),
    getOne: (input) => getClientUseCase.execute(input),
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
  const existing = globalThis.__appRuntime;

  if (existing) {
    return existing.application;
  }

  const runtime = createApplicationRuntime(createBackendConfigFromEnvironment());

  globalThis.__appRuntime = runtime;

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
  const runtime = globalThis.__appRuntime;

  globalThis.__appRuntime = undefined;

  if (runtime) {
    await runtime.close();
  }
};
