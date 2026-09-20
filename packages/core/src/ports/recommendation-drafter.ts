import type { KnowledgeSearchHit } from './knowledge-retriever';
import type { EvidenceReference, ExtractedFacts } from '../domain/client-assessment-facts';
import type { ReadinessScore } from '../domain/readiness-score';
import type { Result } from '../application/result';
import type { RecommendationDraft } from '../domain/recommendation-grounding';

export type DraftRecommendation = RecommendationDraft;

export type RecommendationDraftingInput = Readonly<{
  interactionId: string;
  facts: ExtractedFacts;
  readinessScore: ReadinessScore;
  clientEvidence: readonly EvidenceReference[];
  knowledge: readonly KnowledgeSearchHit[];
}>;

export type RecommendationDraftingFailureReason = 'request_failed' | 'invalid_response';

export type RecommendationDraftingResult = Result<
  readonly DraftRecommendation[],
  RecommendationDraftingFailureReason
>;

export interface RecommendationDrafter {
  draftRecommendations(input: RecommendationDraftingInput): Promise<RecommendationDraftingResult>;
}
