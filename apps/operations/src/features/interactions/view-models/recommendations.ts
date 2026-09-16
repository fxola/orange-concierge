import 'server-only';

import type { ListRecommendationsResult, Recommendation } from '@orange-concierge/core';

export type RecommendationsViewModel =
  | Readonly<{ status: 'ok'; recommendations: readonly Recommendation[] }>
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'unavailable' }>;

export function toRecommendationsViewModel(
  result: ListRecommendationsResult
): RecommendationsViewModel {
  if (result.isFailure()) {
    return { status: 'unavailable' };
  }

  const recommendations = result.getValue();
  if (recommendations.length === 0) {
    return { status: 'empty' };
  }

  return { status: 'ok', recommendations };
}
