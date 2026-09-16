import { ApiError } from '@/lib/api-client';
import { GroundedRecommendation } from '@orange-concierge/core';

export type GenerateRecommendationsViewModel =
  | Readonly<{ status: 'ok'; recommendations: readonly GroundedRecommendation[] }>
  | Readonly<{ status: 'error'; message: string; unauthorized: boolean }>;

function error(message: string, unauthorized = false): GenerateRecommendationsViewModel {
  return { status: 'error', message, unauthorized };
}

export function toGenerateRecommendationsErrorViewModel(
  failure: ApiError
): GenerateRecommendationsViewModel {
  if (failure.status === 401 || failure.code === 'unauthorized') {
    return error('Please sign in to generate recommendations.', true);
  }

  if (failure.status === 404 || failure.code === 'interaction_not_found') {
    return error('That interaction no longer exists.', false);
  }

  if (failure.code === 'invalid_interaction_id') {
    return error('That interaction ID is invalid.', false);
  }

  if (failure.code === 'interaction_analysis_failed') {
    return error('Recommendations need completed analysis before they can be generated.', false);
  }

  if (failure.code === 'recommendation_drafting_failed') {
    return error(
      'The local model timed out or failed while drafting recommendations. Try again, or increase AI_TIMEOUT_MS.',
      false
    );
  }

  return error('Something went wrong while generating recommendations. Try again.', false);
}
