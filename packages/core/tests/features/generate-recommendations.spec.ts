import { expect, vi } from 'vitest';
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
        result = await world.generateRecommendations().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('knowledge is retrieved before recommendations are drafted', () => {
        expect(world.operations()).toEqual(['retrieve', 'draft']);
        expect(world.knowledgeRetriever().requests[0]?.query).not.toContain(world.transcript());
        expect(world.recommendationDrafter().inputs[0]?.knowledge).toEqual([world.knowledgeHit()]);
      });

      And(
        'the grounded recommendation is returned with client evidence and knowledge citations',
        () => {
          expect(result.isSuccess()).toBe(true);
          expect(result.getValue().recommendations).toEqual(
            world.expectedGroundedRecommendations()
          );
        }
      );
    }
  );

  Scenario('Persist grounded recommendations as draft records', ({ Given, And, When, Then }) => {
    const world = generateRecommendationsWorld();
    let result: GenerateRecommendationsResult;
    let saveSpy: ReturnType<typeof vi.spyOn>;

    Given('an analyzed interaction has extracted facts with transcript evidence', () => {
      world.givenAnalyzedInteractionWithEvidence();
    });

    And('relevant internal guidance is retrieved', () => {
      world.givenRelevantInternalGuidanceIsRetrieved();
    });

    And('the recommendation drafter returns a cited recommendation', () => {
      world.givenRecommendationDrafterReturnsCitedRecommendation();
      saveSpy = vi.spyOn(world.recommendationRepository(), 'save');
    });

    When('recommendations are generated for the interaction', async () => {
      result = await world.generateRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
    });

    Then('a draft recommendation is saved with client evidence and knowledge citations', () => {
      expect(result.isSuccess()).toBe(true);
      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining(world.expectedPersistedDraftRecommendation())
      );
      expect(world.savedRecommendations()).toEqual([
        expect.objectContaining(world.expectedPersistedDraftRecommendation()),
      ]);
    });

    And('the generated recommendation response includes the persisted recommendation id', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().recommendations[0]).toMatchObject({
        id: world.expectedPersistedDraftRecommendation().id,
      });
    });
  });

  Scenario('Drop recommendation without known knowledge citation', ({ Given, And, When, Then }) => {
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
      result = await world.generateRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
    });

    Then('no grounded recommendations are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().recommendations).toEqual(world.expectedNoGroundedRecommendations());
    });
  });

  Scenario('Drop recommendation without known client evidence', ({ Given, And, When, Then }) => {
    const world = generateRecommendationsWorld();
    let result: GenerateRecommendationsResult;

    Given('an analyzed interaction has extracted facts with transcript evidence', () => {
      world.givenAnalyzedInteractionWithEvidence();
    });

    And('relevant internal guidance is retrieved', () => {
      world.givenRelevantInternalGuidanceIsRetrieved();
    });

    And(
      'the recommendation drafter returns a recommendation citing unknown client evidence',
      () => {
        world.givenRecommendationDrafterReturnsUnknownClientEvidenceCitation();
      }
    );

    When('recommendations are generated for the interaction', async () => {
      result = await world.generateRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
    });

    Then('no grounded recommendations are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().recommendations).toEqual(world.expectedNoGroundedRecommendations());
    });
  });

  Scenario('Block generation when evidence coverage is low', ({ Given, And, When, Then }) => {
    const world = generateRecommendationsWorld();
    let result: GenerateRecommendationsResult;

    Given('an analyzed interaction has low evidence coverage', () => {
      world.givenAnalyzedInteractionWithLowEvidenceCoverage();
    });

    And('relevant internal guidance is retrieved', () => {
      world.givenRelevantInternalGuidanceIsRetrieved();
    });

    And('the recommendation drafter returns a cited recommendation', () => {
      world.givenRecommendationDrafterReturnsCitedRecommendation();
    });

    When('recommendations are generated for the interaction', async () => {
      result = await world.generateRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
    });

    Then('no grounded recommendations are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().recommendations).toEqual(world.expectedNoGroundedRecommendations());
    });

    And('the recommendation drafter is not invoked', () => {
      expect(world.recommendationDrafter().inputs).toHaveLength(0);
    });
  });

  Scenario(
    'Proceed with generation after facts are human-verified',
    ({ Given, And, When, Then }) => {
      const world = generateRecommendationsWorld();
      let result: GenerateRecommendationsResult;

      Given('an analyzed interaction has low evidence coverage with verified facts', () => {
        world.givenAnalyzedInteractionWithLowEvidenceCoverageAndVerifiedFacts();
      });

      And('relevant internal guidance is retrieved', () => {
        world.givenRelevantInternalGuidanceIsRetrieved();
      });

      And('the recommendation drafter returns a cited recommendation', () => {
        world.givenRecommendationDrafterReturnsCitedRecommendation();
      });

      When('recommendations are generated for the interaction', async () => {
        result = await world.generateRecommendations().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('a grounded recommendation is returned for the verified interaction', () => {
        expect(result.isSuccess()).toBe(true);
        expect(result.getValue().recommendations).toHaveLength(1);
        expect(world.recommendationDrafter().inputs).toHaveLength(1);
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
      result = await world.generateRecommendations().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
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
