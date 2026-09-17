import type { Recommendation } from '@orange-concierge/core';

import { ApiError } from '@/lib/api-client';

export type RecommendationActionViewModel =
  | Readonly<{ status: 'ok'; recommendation: Recommendation }>
  | Readonly<{ status: 'error'; message: string; unauthorized: boolean }>;

function error(message: string, unauthorized = false): RecommendationActionViewModel {
  return { status: 'error', message, unauthorized };
}

export function toRecommendationActionErrorViewModel(
  failure: ApiError
): RecommendationActionViewModel {
  if (failure.status === 401 || failure.code === 'unauthorized') {
    return error('Please sign in to review recommendations.', true);
  }

  if (
    failure.status === 403 ||
    failure.code === 'unauthorized_recommendation_submit_for_review' ||
    failure.code === 'unauthorized_recommendation_review' ||
    failure.code === 'unauthorized_recommendation_edit'
  ) {
    return error('Your role cannot perform that recommendation action.', false);
  }

  if (failure.status === 404 || failure.code === 'recommendation_not_found') {
    return error('That recommendation no longer exists.', false);
  }

  if (failure.status === 409 || failure.code === 'invalid_recommendation_transition') {
    return error('That recommendation is no longer in the right state. Refresh and try again.', false);
  }

  if (failure.code === 'invalid_recommendation_id') {
    return error('That recommendation ID is invalid.', false);
  }

  if (failure.code === 'invalid_review_decision') {
    return error('Choose approve or reject before submitting review.', false);
  }

  if (failure.code === 'recommendation_review_failed') {
    return error('Review failed while recording the audit trail. Try again.', false);
  }

  if (failure.code === 'invalid_recommendation_edit') {
    return error('Check your edits: title and summary must be non-empty, and priority low, medium, or high.', false);
  }

  if (failure.code === 'recommendation_edit_failed') {
    return error('Edit failed while saving the draft. Try again.', false);
  }

  return error('Something went wrong while updating the recommendation. Try again.', false);
}
