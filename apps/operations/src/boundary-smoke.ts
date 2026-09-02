import type { Actor, InteractionRepository } from '@orange-concierge/core';
import type {} from '@orange-concierge/infrastructure';

export const boundarySmokeActor: Actor = {
  id: 'boundary-smoke-consultant',
  role: 'consultant',
};

export const acceptsCoreRepository = (_repository: InteractionRepository): void => {};
