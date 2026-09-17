import 'server-only';

import type { Actor, ListRecommendationsResult, Recommendation } from '@orange-concierge/core';
import {
  canEditRecommendationDrafts,
  canReviewRecommendations,
  canSubmitRecommendationsForReview,
} from '@orange-concierge/core';

export type RecommendationsViewModel =
  | Readonly<{
      status: 'ok';
      recommendations: readonly Recommendation[];
      canReview: boolean;
      canSubmitForReview: boolean;
      canEdit: boolean;
    }>
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'unavailable' }>;

export function toRecommendationsViewModel(
  result: ListRecommendationsResult,
  actor: Actor
): RecommendationsViewModel {
  if (result.isFailure()) {
    return { status: 'unavailable' };
  }

  const recommendations = result.getValue();
  if (recommendations.length === 0) {
    return { status: 'empty' };
  }

  return {
    status: 'ok',
    recommendations,
    canReview: canReviewRecommendations(actor),
    canSubmitForReview: canSubmitRecommendationsForReview(actor),
    canEdit: canEditRecommendationDrafts(actor),
  };
}
