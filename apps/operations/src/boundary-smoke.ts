import type { Actor, InteractionRepository, SubmittedInteractionRecorder } from '@orange-concierge/core';
import type { InfrastructureComposition } from '@orange-concierge/infrastructure';
import { toActor } from './server/composition';

export const boundarySmokeActor: Actor = {
  id: 'boundary-smoke-consultant',
  role: 'consultant',
};

export const acceptsCoreRepository = (_repository: InteractionRepository): void => {};
export const acceptsCoreSubmittedInteractionRecorder = (
  _recorder: SubmittedInteractionRecorder
): void => {};
export const acceptsInfrastructureSubmittedInteractionRecorder = (
  infrastructure: InfrastructureComposition
): SubmittedInteractionRecorder => infrastructure.submittedInteractionRecorder;

export const boundarySmokeMappedActor = toActor({
  id: 'boundary-smoke-consultant',
  role: 'consultant',
});
