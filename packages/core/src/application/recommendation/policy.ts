import type { Actor } from '../../domain/actor';

export const canSubmitRecommendationsForReview = (actor: Actor): boolean => {
  return actor.role === 'admin' || actor.role === 'consultant';
};

export const canReviewRecommendations = (actor: Actor): boolean => {
  return actor.role === 'admin' || actor.role === 'reviewer';
};

export const canEditRecommendationDrafts = (actor: Actor): boolean => {
  return actor.role === 'admin' || actor.role === 'consultant';
};
