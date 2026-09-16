import { expect } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import type { ListRecommendationsResult } from '../../src';
import { listRecommendationsWorld } from '../support/worlds/listRecommendationsWorld';

const feature = await loadFeature('tests/features/list-recommendations.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('List persisted draft recommendations for an interaction', ({ Given, When, Then }) => {
    const world = listRecommendationsWorld();
    let result: ListRecommendationsResult;

    Given('an analyzed interaction has persisted draft recommendations', () => {
      world.givenAnalyzedInteractionHasPersistedDraftRecommendations();
    });

    When('recommendations are listed for the interaction', async () => {
      result = await world.listRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interactionId(),
      });
    });

    Then('the draft recommendations are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual(world.expectedDraftRecommendations());
    });
  });

  Scenario('Listing returns empty when no recommendations exist', ({ Given, When, Then }) => {
    const world = listRecommendationsWorld();
    let result: ListRecommendationsResult;

    Given('an analyzed interaction has no persisted recommendations', () => {
      world.givenAnalyzedInteractionHasNoPersistedRecommendations();
    });

    When('recommendations are listed for the interaction', async () => {
      result = await world.listRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interactionId(),
      });
    });

    Then('no recommendations are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual([]);
    });
  });
});
