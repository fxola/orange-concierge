import type { Recommendation, ReviewRecommendationDecision } from '@orange-concierge/core';

import { ApiError, api } from '@/lib/api-client';
import {
  type RecommendationActionViewModel,
  toRecommendationActionErrorViewModel,
} from '../view-models/review-recommendation';

type RecommendationActionResponse = Readonly<{
  recommendation: Recommendation;
}>;

export async function submitRecommendationForReview(
  recommendationId: string
): Promise<RecommendationActionViewModel> {
  try {
    const response = await api.post<RecommendationActionResponse>(
      `/api/recommendations/${recommendationId}/submit`,
      {}
    );
    return { status: 'ok', recommendation: response.recommendation };
  } catch (error) {
    if (error instanceof ApiError) {
      return toRecommendationActionErrorViewModel(error);
    }
    throw error;
  }
}

export async function reviewRecommendation(
  recommendationId: string,
  decision: ReviewRecommendationDecision
): Promise<RecommendationActionViewModel> {
  try {
    const response = await api.post<RecommendationActionResponse>(
      `/api/recommendations/${recommendationId}/review`,
      { decision }
    );
    return { status: 'ok', recommendation: response.recommendation };
  } catch (error) {
    if (error instanceof ApiError) {
      return toRecommendationActionErrorViewModel(error);
    }
    throw error;
  }
}
