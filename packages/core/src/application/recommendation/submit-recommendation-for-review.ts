import { parseRecommendationId, Recommendation } from '../../domain/recommendation';
import {
  InvalidRecommendationIdError,
  InvalidRecommendationTransitionError,
  RecommendationNotFoundError,
  UnauthorizedSubmitRecommendationForReviewError,
} from '../../errors';
import { Result } from '../result';
import { canSubmitRecommendationsForReview } from './policy';
import type {
  SubmitRecommendationForReviewDependencies,
  SubmitRecommendationForReviewInput,
  SubmitRecommendationForReviewResult,
} from './types';

export class SubmitRecommendationForReview {
  constructor(private readonly deps: SubmitRecommendationForReviewDependencies) {}

  async execute(
    input: SubmitRecommendationForReviewInput
  ): Promise<SubmitRecommendationForReviewResult> {
    const { actor, recommendationId } = input;
    if (!canSubmitRecommendationsForReview(actor)) {
      return Result.failure(new UnauthorizedSubmitRecommendationForReviewError(actor.role));
    }

    const parsedRecommendationId = parseRecommendationId(recommendationId);
    if (!parsedRecommendationId.ok) {
      return Result.failure(new InvalidRecommendationIdError());
    }

    const recommendation = await this.deps.recommendationRepository.findById(
      parsedRecommendationId.recommendationId
    );
    if (!recommendation) {
      return Result.failure(
        new RecommendationNotFoundError(parsedRecommendationId.recommendationId)
      );
    }

    if (recommendation.status !== 'draft') {
      return Result.failure(
        new InvalidRecommendationTransitionError(recommendation.status, 'pending_review')
      );
    }

    const updatedRecommendation: Recommendation = {
      ...recommendation,
      status: 'pending_review',
    };

    await this.deps.recommendationRepository.save(updatedRecommendation);

    return Result.success(updatedRecommendation);
  }
}
