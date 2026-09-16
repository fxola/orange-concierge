import type { Actor } from '../../domain/actor';
import type { Recommendation } from '../../domain/recommendation';
import type { EvidenceReference } from '../interaction/extracted-facts';
import type {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidRecommendationTransitionError,
  RecommendationNotFoundError,
  RecommendationDraftingFailedError,
  RecommendationReviewFailedError,
  UnauthorizedReviewRecommendationError,
  UnauthorizedSubmitRecommendationForReviewError,
} from '../../errors';
import type { InteractionRepository } from '../../ports/interaction-repository';
import type { KnowledgeRetriever, KnowledgeSearchHit } from '../../ports/knowledge-retriever';
import type { RecommendationRepository } from '../../ports/recommendation-repository';
import type { RecommendationReviewTransactionManager } from '../../ports/transaction-manager';
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

export type SubmitRecommendationForReviewInput = Readonly<{
  actor: Actor;
  recommendationId: string;
}>;

export type SubmitRecommendationForReviewDependencies = Readonly<{
  recommendationRepository: RecommendationRepository;
}>;

export type SubmitRecommendationForReviewError =
  | RecommendationNotFoundError
  | InvalidRecommendationTransitionError
  | UnauthorizedSubmitRecommendationForReviewError;

export type SubmitRecommendationForReviewResult = Result<
  Recommendation,
  SubmitRecommendationForReviewError
>;

export type ReviewRecommendationDecision = 'approved' | 'rejected';

export type ReviewRecommendationInput = Readonly<{
  actor: Actor;
  recommendationId: string;
  decision: ReviewRecommendationDecision;
}>;

export type ReviewRecommendationDependencies = Readonly<{
  recommendationRepository: RecommendationRepository;
  transactionManager: RecommendationReviewTransactionManager;
  now: () => Date;
}>;

export type ReviewRecommendationError =
  | RecommendationNotFoundError
  | InvalidRecommendationTransitionError
  | RecommendationReviewFailedError
  | UnauthorizedReviewRecommendationError;

export type ReviewRecommendationResult = Result<Recommendation, ReviewRecommendationError>;
