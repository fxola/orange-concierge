import {
  ReviewRecommendation,
  SubmitRecommendationForReview,
  type Actor,
  type Recommendation,
  type RecommendationStatus,
  type ReviewRecommendationResult,
  type SubmitRecommendationForReviewResult,
} from '../../../src';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';
import { InMemoryRecommendationReviewTransactionManager } from '../in-memory-adapters/inMemoryRecommendationTransactionManager';
import { InMemoryRecommendationRepository } from '../in-memory-adapters/inMemoryRecommendationRepository';

type ReviewableRecommendation = Recommendation &
  Readonly<{
    priority: 'high' | 'medium' | 'low';
    summary: string;
    reviewerId?: string;
    reviewedAt?: Date;
  }>;

export type { ReviewRecommendationResult, SubmitRecommendationForReviewResult };

const fixedCreatedAt = new Date('2026-09-16T09:00:00.000Z');
const fixedReviewedAt = new Date('2026-09-16T10:00:00.000Z');

const consultant: Actor = { id: 'consultant-1', role: 'consultant' };
const reviewer: Actor = { id: 'reviewer-1', role: 'reviewer' };
const admin: Actor = { id: 'admin-1', role: 'admin' };

const recommendationId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const clientId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const interactionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function recommendationWithStatus(status: RecommendationStatus): ReviewableRecommendation {
  return {
    id: recommendationId,
    clientId,
    interactionId,
    status,
    title: 'Run self-custody readiness discovery',
    rationale: 'Recovery planning must be confirmed before funds move off exchange.',
    summary: 'Confirm recovery planning and hardware-wallet controls before moving funds.',
    priority: 'high',
    createdAt: fixedCreatedAt,
  };
}

export function reviewRecommendationWorld() {
  const audit = new RecordingAudit();
  let recommendationRepository = new InMemoryRecommendationRepository(
    recommendationWithStatus('draft')
  );
  let transactionManager = new InMemoryRecommendationReviewTransactionManager(
    recommendationRepository,
    audit
  );
  let submitRecommendationForReview = new SubmitRecommendationForReview({
    recommendationRepository,
  });
  let reviewRecommendation = new ReviewRecommendation({
    recommendationRepository,
    transactionManager,
    now: () => fixedReviewedAt,
  });

  const composeRecommendationFixture = (recommendation: ReviewableRecommendation) => {
    audit.events.length = 0;
    recommendationRepository = new InMemoryRecommendationRepository(recommendation);
    transactionManager = new InMemoryRecommendationReviewTransactionManager(
      recommendationRepository,
      audit
    );
    submitRecommendationForReview = new SubmitRecommendationForReview({
      recommendationRepository,
    });
    reviewRecommendation = new ReviewRecommendation({
      recommendationRepository,
      transactionManager,
      now: () => fixedReviewedAt,
    });
  };

  return {
    givenDraftRecommendation() {
      composeRecommendationFixture(recommendationWithStatus('draft'));
    },

    givenPendingReviewRecommendation() {
      composeRecommendationFixture(recommendationWithStatus('pending_review'));
    },

    submitRecommendationForReview() {
      return submitRecommendationForReview;
    },

    reviewRecommendation() {
      return reviewRecommendation;
    },

    recommendation() {
      const current = recommendationRepository.getCurrent();
      if (!current) {
        throw new Error('recommendation should be set');
      }

      return current as ReviewableRecommendation;
    },

    audit() {
      return audit;
    },

    failTransactionalAuditRecording() {
      transactionManager.failNextTransactionalAudit();
    },

    reviewer() {
      return reviewer;
    },

    admin() {
      return admin;
    },

    fixedReviewedAt() {
      return fixedReviewedAt;
    },

    sensitiveRecommendationText() {
      const current = recommendationRepository.getCurrent() as ReviewableRecommendation | null;
      if (!current) {
        throw new Error('recommendation should be set');
      }

      return [current.title, current.rationale, current.summary];
    },

    consultant() {
      return consultant;
    },

    clientId() {
      return clientId;
    },

    interactionId() {
      return interactionId;
    },
  };
}
