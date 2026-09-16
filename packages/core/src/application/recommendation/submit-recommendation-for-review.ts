import { Recommendation } from '../../domain/recommendation';
import {
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
    if (!canSubmitRecommendationsForReview(input.actor)) {
      return Result.failure(new UnauthorizedSubmitRecommendationForReviewError(input.actor.role));
    }

    const recommendation = await this.deps.recommendationRepository.findById(
      input.recommendationId
    );
    if (!recommendation) {
      return Result.failure(new RecommendationNotFoundError(input.recommendationId));
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
