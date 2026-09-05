import { randomUUID } from 'node:crypto';

import { SubmitInteraction } from '@orange-concierge/core';

import { DrizzleSubmittedInteractionRecorder } from '../adapters/interaction/submitted-interaction-recorder';
import { createAuth } from '../auth';
import { createDatabaseFromUrl } from '../database/connection';
import { createBackendConfigFromEnvironment, type BackendConfig } from './config';
import type { Application } from './types';

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

  const submittedInteractionRecorder = new DrizzleSubmittedInteractionRecorder(db);
  const submitInteractionUseCase = new SubmitInteraction({
    submittedInteractionRecorder,
    newInteractionId: randomUUID,
    now: () => new Date(),
  });

  const application: Application = {
    auth,
    interaction: {
      submit: (input) => submitInteractionUseCase.execute(input),
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
