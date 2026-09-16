import type { AuditEvent } from '../../ports/audit';
import {
  InvalidRecommendationTransitionError,
  RecommendationNotFoundError,
  RecommendationReviewFailedError,
  UnauthorizedReviewRecommendationError,
} from '../../errors';
import { Result } from '../result';
import { canReviewRecommendations } from './policy';
import type {
  ReviewRecommendationDependencies,
  ReviewRecommendationInput,
  ReviewRecommendationResult,
} from './types';
import type { Recommendation } from '../../domain/recommendation';

export class ReviewRecommendation {
  constructor(private readonly deps: ReviewRecommendationDependencies) {}

  async execute(input: ReviewRecommendationInput): Promise<ReviewRecommendationResult> {
    const { actor, recommendationId, decision } = input;
    if (!canReviewRecommendations(actor)) {
      return Result.failure(new UnauthorizedReviewRecommendationError(actor.role));
    }

    const recommendation = await this.deps.recommendationRepository.findById(recommendationId);
    if (!recommendation) {
      return Result.failure(new RecommendationNotFoundError(recommendationId));
    }

    const previousStatus = recommendation.status;
    if (previousStatus !== 'pending_review') {
      return Result.failure(new InvalidRecommendationTransitionError(previousStatus, decision));
    }

    const reviewedAt = this.deps.now();
    const updatedRecommendation: Recommendation = {
      ...recommendation,
      status: decision,
      reviewerId: actor.id,
      reviewedAt,
    };
    const auditEvent: AuditEvent = {
      actor: input.actor,
      action: 'recommendation_reviewed',
      resource: { type: 'recommendation', id: recommendation.id },
      occurredAt: reviewedAt,
      metadata: {
        previousStatus,
        newStatus: input.decision,
        interactionId: recommendation.interactionId,
        clientId: recommendation.clientId,
      },
    };

    try {
      await this.deps.transactionManager.execute(async (tx) => {
        await tx.recommendations.save(updatedRecommendation);
        await tx.audit.record(auditEvent);
      });
    } catch (error) {
      return Result.failure(new RecommendationReviewFailedError(error));
    }

    return Result.success(updatedRecommendation);
  }
}
