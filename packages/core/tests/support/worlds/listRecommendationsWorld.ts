import { ListRecommendations, type Actor, type Recommendation } from '../../../src';
import { InMemoryRecommendationRepository } from '../in-memory-adapters/inMemoryRecommendationRepository';

const consultant: Actor = { id: 'consultant-1', role: 'consultant' };
const fixedDate = new Date('2026-09-14T10:00:00.000Z');

const interactionId = 'interaction-1';
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

export function listRecommendationsWorld() {
  const recommendationRepository = new InMemoryRecommendationRepository(null);

  return {
    givenAnalyzedInteractionHasPersistedDraftRecommendations() {
      // clear and add two drafts
      (recommendationRepository as any).recommendations.length = 0;
      recommendationRepository.save(draftRecommendation('recommendation-1', 'Run self-custody readiness discovery'));
      recommendationRepository.save(draftRecommendation('recommendation-2', 'Document recovery plan'));
    },

    givenAnalyzedInteractionHasNoPersistedRecommendations() {
      (recommendationRepository as any).recommendations.length = 0;
    },

    listRecommendations() {
      return new ListRecommendations({ recommendationRepository });
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
        draftRecommendation('recommendation-1', 'Run self-custody readiness discovery'),
        draftRecommendation('recommendation-2', 'Document recovery plan'),
      ];
    },
  };
}
