import type { KnowledgeSearchHit } from './knowledge-retriever';
import type { EvidenceReference, ExtractedFacts } from '../application/interaction/extracted-facts';
import type { ReadinessScore } from '../domain/readiness-score';
import type { Result } from '../application/result';

export type RecommendationPriority = 'low' | 'medium' | 'high';

export type DraftRecommendation = Readonly<{
  title: string;
  summary: string;
  priority: RecommendationPriority;
  clientEvidence: readonly string[];
  knowledgeSources: readonly string[];
}>;

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
