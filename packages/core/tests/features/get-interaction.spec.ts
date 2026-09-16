import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import {
  GetInteraction,
  InteractionNotFoundError,
  InvalidClientIdError,
  type Actor,
  type GetInteractionResult,
  type Interaction,
} from '../../src';
import { InMemoryInteractionRepository } from '../support/in-memory-adapters/inMemoryInteractionRepository';

const feature = await loadFeature('tests/features/get-interaction.feature');

const CLIENT_ID = '98d4ea70-45e2-4c21-8767-3bbe0ae070a7';
const OTHER_CLIENT_ID = '3e2359ca-0b89-48b5-a1d2-d57bd3d0b4ef';
const INTERACTION_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const fixedDate = new Date('2026-09-01T10:00:00.000Z');

const consultant: Actor = {
  id: 'consultant-1',
  role: 'consultant',
};

function interactionFor(clientId: string): Interaction {
  return {
    id: INTERACTION_ID,
    clientId,
    submittedBy: consultant.id,
    status: 'received',
    transcript: 'Client asked about custody next steps.',
    createdAt: fixedDate,
  };
}

describeFeature(feature, ({ Scenario }) => {
  Scenario('Consultant opens an interaction for the matching client', ({ Given, And, When, Then }) => {
    let interactionsRepo: InMemoryInteractionRepository;
    let result: GetInteractionResult;

    Given('a consultant actor', () => {
      expect(consultant.role).toBe('consultant');
    });

    And('a received interaction exists for the scoped client', () => {
      interactionsRepo = new InMemoryInteractionRepository(interactionFor(CLIENT_ID));
    });

    When('the consultant opens that interaction for the scoped client', async () => {
      result = await new GetInteraction({ interactionsRepo }).execute({
        actor: consultant,
        clientId: CLIENT_ID,
        interactionId: INTERACTION_ID,
      });
    });

    Then('that interaction is returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(interactionFor(CLIENT_ID));
    });
  });

  Scenario('Hide an interaction that belongs to another client', ({ Given, And, When, Then }) => {
    let interactionsRepo: InMemoryInteractionRepository;
    let result: GetInteractionResult;

    Given('a consultant actor', () => {
      expect(consultant.role).toBe('consultant');
    });

    And('a received interaction exists for another client', () => {
      interactionsRepo = new InMemoryInteractionRepository(interactionFor(OTHER_CLIENT_ID));
    });

    When('the consultant opens that interaction for the scoped client', async () => {
      result = await new GetInteraction({ interactionsRepo }).execute({
        actor: consultant,
        clientId: CLIENT_ID,
        interactionId: INTERACTION_ID,
      });
    });

    Then('the request is rejected as interaction not found', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(InteractionNotFoundError);
    });
  });

  Scenario('Reject blank client id without touching the repository', ({ Given, When, Then, And }) => {
    const interactionsRepo = new InMemoryInteractionRepository(interactionFor(CLIENT_ID));
    let result: GetInteractionResult;
    let findSpy: ReturnType<typeof vi.spyOn>;

    Given('a consultant actor', () => {
      expect(consultant.role).toBe('consultant');
      findSpy = vi.spyOn(interactionsRepo, 'findById');
    });

    When('the consultant opens an interaction with a blank client id', async () => {
      result = await new GetInteraction({ interactionsRepo }).execute({
        actor: consultant,
        clientId: '   ',
        interactionId: INTERACTION_ID,
      });
    });

    Then('the request is rejected as invalid client id', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(InvalidClientIdError);
    });

    And('the interaction repository is never queried', () => {
      expect(findSpy).not.toHaveBeenCalled();
    });
  });
});
