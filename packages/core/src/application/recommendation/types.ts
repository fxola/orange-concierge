import type { Actor } from '../../domain/actor';
import type { EvidenceReference } from '../interaction/extracted-facts';
import type {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  RecommendationDraftingFailedError,
} from '../../errors';
import type { InteractionRepository } from '../../ports/interaction-repository';
import type { KnowledgeRetriever, KnowledgeSearchHit } from '../../ports/knowledge-retriever';
import type {
  RecommendationDrafter,
  RecommendationPriority,
} from '../../ports/recommendation-drafter';
import type { Result } from '../result';

export type GenerateRecommendationsInput = Readonly<{
  actor: Actor;
  interactionId: string;
}>;

export type GenerateRecommendationsDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
  KnowledgeRetriever: KnowledgeRetriever;
  recommendationDrafter: RecommendationDrafter;
}>;

export type GroundedRecommendation = Readonly<{
  title: string;
  summary: string;
  priority: RecommendationPriority;
  clientEvidence: readonly EvidenceReference[];
  knowledgeCitations: readonly KnowledgeSearchHit[];
}>;

export type GenerateRecommendationsSuccess = Readonly<{
  recommendations: readonly GroundedRecommendation[];
}>;

export type GenerateRecommendationsError =
  | InteractionNotFoundError
  | InteractionAnalysisFailedError
  | RecommendationDraftingFailedError;

export type GenerateRecommendationsResult = Result<
  GenerateRecommendationsSuccess,
  GenerateRecommendationsError
>;
