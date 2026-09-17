import { Actor } from '../domain/actor';
import type { RecommendationDraftingFailureReason } from '../ports/recommendation-drafter';

export class UnauthorizedAnalyzeInteractionError extends Error {
  readonly code = 'unauthorized_analyze';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot analyze interactions`);
    this.name = 'UnauthorizedAnalyzeInteractionError';
  }
}

export class InteractionNotFoundError extends Error {
  readonly code = 'interaction_not_found';
  constructor(id: string) {
    super(`Interaction:${id} not found`);
    this.name = 'InteractionNotFoundError';
  }
}

export class InvalidInteractionStateError extends Error {
  readonly code = 'invalid_interaction_state';
  constructor(status: string) {
    super(`Interaction with status ${status} cannot be analyzed`);
    this.name = 'InvalidInteractionStateError';
  }
}

export class InteractionAnalysisFailedError extends Error {
  readonly code = 'interaction_analysis_failed';
  constructor() {
    super('Interaction analysis failed');
    this.name = 'InteractionAnalysisFailedError';
  }
}

export class RecommendationDraftingFailedError extends Error {
  readonly code = 'recommendation_drafting_failed';
  readonly reason: RecommendationDraftingFailureReason;

  constructor(reason: RecommendationDraftingFailureReason) {
    super(`Recommendation drafting failed: ${reason}`);
    this.name = 'RecommendationDraftingFailedError';
    this.reason = reason;
  }
}

export class RecommendationReviewFailedError extends Error {
  readonly code = 'recommendation_review_failed';
  constructor(cause?: unknown) {
    super('Recommendation review failed');
    this.name = 'RecommendationReviewFailedError';
    this.cause = cause as Error | undefined;
  }
}

export class RecommendationNotFoundError extends Error {
  readonly code = 'recommendation_not_found';
  constructor(id: string) {
    super(`Recommendation:${id} not found`);
    this.name = 'RecommendationNotFoundError';
  }
}

export class InvalidRecommendationTransitionError extends Error {
  readonly code = 'invalid_recommendation_transition';
  constructor(from: string, to: string) {
    super(`Recommendation cannot transition from ${from} to ${to}`);
    this.name = 'InvalidRecommendationTransitionError';
  }
}

export class UnauthorizedReviewRecommendationError extends Error {
  readonly code = 'unauthorized_recommendation_review';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot review recommendations`);
    this.name = 'UnauthorizedReviewRecommendationError';
  }
}

export class UnauthorizedSubmitRecommendationForReviewError extends Error {
  readonly code = 'unauthorized_recommendation_submit_for_review';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot submit recommendations for review`);
    this.name = 'UnauthorizedSubmitRecommendationForReviewError';
  }
}

export class UnauthorizedEditRecommendationError extends Error {
  readonly code = 'unauthorized_recommendation_edit';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot edit recommendation drafts`);
    this.name = 'UnauthorizedEditRecommendationError';
  }
}

export class InvalidRecommendationEditError extends Error {
  readonly code = 'invalid_recommendation_edit';
  constructor(reason: string) {
    super(`Recommendation edit is invalid: ${reason}`);
    this.name = 'InvalidRecommendationEditError';
  }
}

export class RecommendationEditFailedError extends Error {
  readonly code = 'recommendation_edit_failed';
  constructor(cause?: unknown) {
    super('Recommendation edit failed');
    this.name = 'RecommendationEditFailedError';
    this.cause = cause as Error | undefined;
  }
}

export class BlankTranscriptError extends Error {
  readonly code = 'blank_transcript';
  constructor() {
    super('Transcript must not be blank');
    this.name = 'BlankTranscriptError';
  }
}

export class UnauthorizedSubmitInteractionError extends Error {
  readonly code = 'unauthorized_submit';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot submit interactions`);
    this.name = 'UnauthorizedSubmitInteractionError';
  }
}

export class InteractionSubmissionFailedError extends Error {
  readonly code = 'submission_failed';
  constructor(cause?: unknown) {
    super('Interaction submission failed');
    this.name = 'InteractionSubmissionFailedError';
    this.cause = cause as Error | undefined;
  }
}

export class ClientNotFoundError extends Error {
  readonly code = 'client_not_found';
  constructor(id: string) {
    super(`Client:${id} not found`);
    this.name = 'ClientNotFoundError';
  }
}

export class InvalidClientIdError extends Error {
  readonly code = 'invalid_client_id';
  constructor() {
    super('Client id must be a valid UUID');
    this.name = 'InvalidClientIdError';
  }
}

export class InvalidInteractionIdError extends Error {
  readonly code = 'invalid_interaction_id';
  constructor() {
    super('Interaction id must be a valid UUID');
    this.name = 'InvalidInteractionIdError';
  }
}

export class InvalidRecommendationIdError extends Error {
  readonly code = 'invalid_recommendation_id';
  constructor() {
    super('Recommendation id must be a valid UUID');
    this.name = 'InvalidRecommendationIdError';
  }
}

export class InvalidPaginationError extends Error {
  readonly code = 'invalid_pagination';
  constructor() {
    super('Pagination must satisfy limit 1-100 and a non-negative integer offset');
    this.name = 'InvalidPaginationError';
  }
}

export class InvalidKnowledgeSearchQueryError extends Error {
  readonly code = 'invalid_knowledge_search_query';
  constructor() {
    super('Knowledge search query must not be blank');
    this.name = 'InvalidKnowledgeSearchQueryError';
  }
}

export class InvalidKnowledgeSearchLimitError extends Error {
  readonly code = 'invalid_knowledge_search_limit';
  constructor() {
    super('Knowledge search limit must be between 1 and 20');
    this.name = 'InvalidKnowledgeSearchLimitError';
  }
}

export class UnauthorizedViewClientsError extends Error {
  readonly code = 'unauthorized_view';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot view clients`);
    this.name = 'UnauthorizedViewClientsError';
  }
}

export class UnauthorizedError extends Error {
  readonly code = 'unauthorized';
  constructor() {
    super('You need to be logged in to perform this operation');
    this.name = 'UnauthorizedError';
  }
}
