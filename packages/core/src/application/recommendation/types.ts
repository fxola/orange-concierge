import type { Actor } from '../../domain/actor';
import type { Recommendation, RecommendationPriority } from '../../domain/recommendation';
import type { GroundedRecommendation } from '../../domain/recommendation/grounding';
import type {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidInteractionIdError,
  InvalidRecommendationEditError,
  InvalidRecommendationIdError,
  InvalidRecommendationTransitionError,
  RecommendationEditFailedError,
  RecommendationNotFoundError,
  RecommendationDraftingFailedError,
  RecommendationReviewFailedError,
  UnauthorizedEditRecommendationError,
  UnauthorizedReviewRecommendationError,
  UnauthorizedSubmitRecommendationForReviewError,
} from '../../errors';
import type { InteractionRepository } from '../../ports/interaction-repository';
import type { KnowledgeRetriever } from '../../ports/knowledge-retriever';
import type { RecommendationRepository } from '../../ports/recommendation-repository';
import type { RecommendationTransactionManager } from '../../ports/transaction-manager';
import type { RecommendationDrafter } from '../../ports/recommendation-drafter';
import type { Result } from '../result';

export type GenerateRecommendationsInput = Readonly<{
  actor: Actor;
  interactionId: string;
}>;

export type GenerateRecommendationsDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
  knowledgeRetriever: KnowledgeRetriever;
  recommendationDrafter: RecommendationDrafter;
  transactionManager: RecommendationTransactionManager;
  newRecommendationId: () => string;
  now: () => Date;
}>;

export type GenerateRecommendationsSuccess = Readonly<{
  recommendations: readonly GroundedRecommendation[];
}>;

export type GenerateRecommendationsError =
  | InteractionNotFoundError
  | InvalidInteractionIdError
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
  | InvalidRecommendationIdError
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
  transactionManager: RecommendationTransactionManager;
  now: () => Date;
}>;

export type ReviewRecommendationError =
  | RecommendationNotFoundError
  | InvalidRecommendationIdError
  | InvalidRecommendationTransitionError
  | RecommendationReviewFailedError
  | UnauthorizedReviewRecommendationError;

export type ReviewRecommendationResult = Result<Recommendation, ReviewRecommendationError>;

export type EditRecommendationDraftPatch = Readonly<{
  title?: string;
  summary?: string;
  priority?: RecommendationPriority;
}>;

export type EditRecommendationDraftInput = Readonly<{
  actor: Actor;
  recommendationId: string;
  patch: EditRecommendationDraftPatch;
}>;

export type EditRecommendationDraftDependencies = Readonly<{
  recommendationRepository: RecommendationRepository;
  transactionManager: RecommendationTransactionManager;
  now: () => Date;
}>;

export type EditRecommendationDraftError =
  | RecommendationNotFoundError
  | InvalidRecommendationIdError
  | InvalidRecommendationTransitionError
  | InvalidRecommendationEditError
  | RecommendationEditFailedError
  | UnauthorizedEditRecommendationError;

export type EditRecommendationDraftResult = Result<Recommendation, EditRecommendationDraftError>;

export type ListRecommendationsInput = Readonly<{
  actor: Actor;
  interactionId: string;
  includeSuperseded?: boolean;
}>;

export type ListRecommendationsDependencies = Readonly<{
  recommendationRepository: RecommendationRepository;
  interactionRepository: InteractionRepository;
}>;

export type ListRecommendationsResult = Result<
  readonly Recommendation[],
  InteractionNotFoundError | InvalidInteractionIdError
>;
