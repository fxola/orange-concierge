import { expect } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import type { GenerateRecommendationsResult } from '../../src';
import { generateRecommendationsWorld } from '../support/worlds/generateRecommendationsWorld';

const feature = await loadFeature('tests/features/generate-recommendations.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario(
    'Generate grounded recommendations from completed analysis',
    ({ Given, And, When, Then }) => {
      const world = generateRecommendationsWorld();
      let result: GenerateRecommendationsResult;

      Given('an analyzed interaction has extracted facts with transcript evidence', () => {
        world.givenAnalyzedInteractionWithEvidence();
      });

      And('relevant internal guidance is retrieved', () => {
        world.givenRelevantInternalGuidanceIsRetrieved();
      });

      And('the recommendation drafter returns a cited recommendation', () => {
        world.givenRecommendationDrafterReturnsCitedRecommendation();
      });

      When('recommendations are generated for the interaction', async () => {
        result = await world.generateRecommendations();
      });

      Then('knowledge is retrieved before recommendations are drafted', () => {
        expect(world.operations()).toEqual(['retrieve', 'draft']);
        expect(world.knowledgeRetriever().requests[0]?.query).not.toContain(world.transcript());
        expect(world.recommendationDrafter().inputs[0]?.knowledge).toEqual([
          world.knowledgeHit(),
        ]);
      });

      And(
        'the grounded recommendation is returned with client evidence and knowledge citations',
        () => {
          expect(result.isSuccess()).toBe(true);
          expect(result.getValue().recommendations).toEqual(world.expectedGroundedRecommendations());
        }
      );
    }
  );

  Scenario(
    'Drop recommendation without known knowledge citation',
    ({ Given, And, When, Then }) => {
      const world = generateRecommendationsWorld();
      let result: GenerateRecommendationsResult;

      Given('an analyzed interaction has extracted facts with transcript evidence', () => {
        world.givenAnalyzedInteractionWithEvidence();
      });

      And('relevant internal guidance is retrieved', () => {
        world.givenRelevantInternalGuidanceIsRetrieved();
      });

      And('the recommendation drafter returns a recommendation citing unknown knowledge', () => {
        world.givenRecommendationDrafterReturnsUnknownKnowledgeCitation();
      });

      When('recommendations are generated for the interaction', async () => {
        result = await world.generateRecommendations();
      });

      Then('no grounded recommendations are returned', () => {
        expect(result.isSuccess()).toBe(true);
        expect(result.getValue().recommendations).toEqual(
          world.expectedNoGroundedRecommendations()
        );
      });
    }
  );

  Scenario(
    'Drop recommendation without known client evidence',
    ({ Given, And, When, Then }) => {
      const world = generateRecommendationsWorld();
      let result: GenerateRecommendationsResult;

      Given('an analyzed interaction has extracted facts with transcript evidence', () => {
        world.givenAnalyzedInteractionWithEvidence();
      });

      And('relevant internal guidance is retrieved', () => {
        world.givenRelevantInternalGuidanceIsRetrieved();
      });

      And('the recommendation drafter returns a recommendation citing unknown client evidence', () => {
        world.givenRecommendationDrafterReturnsUnknownClientEvidenceCitation();
      });

      When('recommendations are generated for the interaction', async () => {
        result = await world.generateRecommendations();
      });

      Then('no grounded recommendations are returned', () => {
        expect(result.isSuccess()).toBe(true);
        expect(result.getValue().recommendations).toEqual(
          world.expectedNoGroundedRecommendations()
        );
      });
    }
  );

  Scenario('Fail when recommendation drafting fails', ({ Given, And, When, Then }) => {
    const world = generateRecommendationsWorld();
    let result: GenerateRecommendationsResult;

    Given('an analyzed interaction has extracted facts with transcript evidence', () => {
      world.givenAnalyzedInteractionWithEvidence();
    });

    And('relevant internal guidance is retrieved', () => {
      world.givenRelevantInternalGuidanceIsRetrieved();
    });

    And('the recommendation drafter request fails', () => {
      world.givenRecommendationDrafterRequestFails();
    });

    When('recommendations are generated for the interaction', async () => {
      result = await world.generateRecommendations();
    });

    Then('recommendation drafting failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toMatchObject({
        code: 'recommendation_drafting_failed',
        reason: 'request_failed',
      });
    });
  });
});
