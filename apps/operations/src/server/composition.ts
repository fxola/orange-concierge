import { randomUUID } from 'node:crypto';
import { SubmitInteraction, type Actor, type ActorRole } from '@orange-concierge/core';
import { createInfrastructure } from '@orange-concierge/infrastructure';

export type AuthenticatedUser = Readonly<{
  id: string;
  role: ActorRole;
}>;

export type ApplicationComposition = Readonly<{
  submitInteraction: SubmitInteraction;
  toActor: (user: AuthenticatedUser) => Actor;
  close: () => Promise<void>;
}>;

export const toActor = (user: AuthenticatedUser): Actor => ({
  id: user.id,
  role: user.role,
});

export const bootstrapApplication = (input: { databaseUrl: string }): ApplicationComposition => {
  const { submittedInteractionRecorder, close } = createInfrastructure({
    databaseUrl: input.databaseUrl,
  });

  const submitInteraction = new SubmitInteraction({
    submittedInteractionRecorder,
    newInteractionId: randomUUID,
    now: () => new Date(),
  });

  return {
    submitInteraction,
    toActor,
    close,
  };
};
