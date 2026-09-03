import type { SubmittedInteractionRecorder } from '@orange-concierge/core';
import { createDatabaseFromUrl } from '@orange-concierge/db';
import { DrizzleSubmittedInteractionRecorder } from './submitted-interaction-recorder';

export type InfrastructureComposition = Readonly<{
  submittedInteractionRecorder: SubmittedInteractionRecorder;
  close: () => Promise<void>;
}>;

export const createInfrastructure = (input: { databaseUrl: string }): InfrastructureComposition => {
  const { db, client } = createDatabaseFromUrl(input.databaseUrl);
  const submittedInteractionRecorder = new DrizzleSubmittedInteractionRecorder(db);

  return {
    submittedInteractionRecorder,
    close: () => client.end(),
  };
};
