import { createAuth, type OrangeConciergeAuth } from '@orange-concierge/auth';
import type { SubmittedInteractionRecorder } from '@orange-concierge/core';
import type { OrangeConciergeDB, PostgresClient } from '@orange-concierge/db';
import { createDatabaseFromUrl } from './database';
import { DrizzleSubmittedInteractionRecorder } from './submitted-interaction-recorder';

export type InfrastructureComposition = Readonly<{
  db: OrangeConciergeDB;
  client: PostgresClient;
  submittedInteractionRecorder: SubmittedInteractionRecorder;
  auth: OrangeConciergeAuth;
  close: () => Promise<void>;
}>;

export type CreateInfrastructureInput = Readonly<{
  databaseUrl: string;
  baseUrl?: string;
  authSecret?: string;
  trustedOrigins?: string[];
}>;

/**
 * All concrete Adapters are wired here
 * @param input CreateInfrastructureInput
 * @returns InfrastructureComposition
 */
export const createInfrastructure = (
  input: CreateInfrastructureInput
): InfrastructureComposition => {
  const { db, client } = createDatabaseFromUrl(input.databaseUrl);
  const { baseUrl, authSecret: secret, trustedOrigins } = input;

  const auth = createAuth({ db, baseURL: baseUrl, secret, trustedOrigins });
  const submittedInteractionRecorder = new DrizzleSubmittedInteractionRecorder(db);

  return {
    db,
    client,
    auth,
    submittedInteractionRecorder,
    close: () => client.end(),
  };
};
