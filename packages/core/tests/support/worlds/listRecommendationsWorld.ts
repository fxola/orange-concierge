import { Interaction, ListRecommendations, type Actor, type Recommendation } from '../../../src';
import { InMemoryInteractionRepository } from '../in-memory-adapters/inMemoryInteractionRepository';
import { InMemoryRecommendationRepository } from '../in-memory-adapters/inMemoryRecommendationRepository';

const consultant: Actor = { id: 'consultant-1', role: 'consultant' };
const fixedDate = new Date('2026-09-14T10:00:00.000Z');

const interactionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const clientId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function draftRecommendation(id: string, title: string): Recommendation {
  return {
    id,
    clientId,
    interactionId,
    status: 'draft',
    title,
    rationale: `Rationale for ${title}`,
    summary: `Summary for ${title}`,
    priority: 'high',
    clientEvidence: [],
    knowledgeCitations: [],
    createdAt: fixedDate,
  };
}

function supersededRecommendation(id: string, title: string): Recommendation {
  return {
    ...draftRecommendation(id, title),
    status: 'superseded',
    supersededAt: fixedDate,
  };
}

function analyzedInteraction(): Interaction {
  return {
    id: interactionId,
    clientId,
    submittedBy: consultant.id,
    status: 'analysis_completed',
    transcript: 'test transcript',
    createdAt: fixedDate,
  };
}

export function listRecommendationsWorld() {
  const recommendationRepository = new InMemoryRecommendationRepository(null);
  const interactionRepository = new InMemoryInteractionRepository(analyzedInteraction());

  return {
    givenAnalyzedInteractionHasPersistedDraftRecommendations() {
      // clear and add two drafts
      (recommendationRepository as any).recommendations.length = 0;
      (interactionRepository as any).current = analyzedInteraction();
      (interactionRepository as any).interactions = [analyzedInteraction()];
      recommendationRepository.save(
        draftRecommendation('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Run self-custody readiness discovery')
      );
      recommendationRepository.save(
        draftRecommendation('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Document recovery plan')
      );
    },

    givenAnalyzedInteractionHasNoPersistedRecommendations() {
      (recommendationRepository as any).recommendations.length = 0;
      (interactionRepository as any).current = analyzedInteraction();
      (interactionRepository as any).interactions = [analyzedInteraction()];
    },

    givenAnalyzedInteractionHasDraftAndSupersededRecommendations() {
      (recommendationRepository as any).recommendations.length = 0;
      (interactionRepository as any).current = analyzedInteraction();
      (interactionRepository as any).interactions = [analyzedInteraction()];
      recommendationRepository.save(
        draftRecommendation('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Run self-custody readiness discovery')
      );
      recommendationRepository.save(
        supersededRecommendation('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Document recovery plan')
      );
    },

    listRecommendations() {
      return new ListRecommendations({ recommendationRepository, interactionRepository });
    },

    consultant() {
      return consultant;
    },

    interactionId() {
      return interactionId;
    },

    recommendationRepository() {
      return recommendationRepository;
    },

    expectedDraftRecommendations(): readonly Recommendation[] {
      return [
        draftRecommendation('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Run self-custody readiness discovery'),
        draftRecommendation('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Document recovery plan'),
      ];
    },

    expectedNonSupersededRecommendations(): readonly Recommendation[] {
      return [draftRecommendation('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Run self-custody readiness discovery')];
    },

    expectedAllRecommendations(): readonly Recommendation[] {
      return [
        draftRecommendation('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Run self-custody readiness discovery'),
        supersededRecommendation('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Document recovery plan'),
      ];
    },
  };
}
