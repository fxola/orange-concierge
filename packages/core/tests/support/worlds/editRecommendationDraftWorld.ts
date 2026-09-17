import {
  EditRecommendationDraft,
  type Actor,
  type EditRecommendationDraftResult,
  type Recommendation,
  type RecommendationStatus,
} from '../../../src';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';
import { InMemoryRecommendationReviewTransactionManager } from '../in-memory-adapters/inMemoryRecommendationTransactionManager';
import { InMemoryRecommendationRepository } from '../in-memory-adapters/inMemoryRecommendationRepository';

export type { EditRecommendationDraftResult };

const fixedCreatedAt = new Date('2026-09-16T09:00:00.000Z');
const fixedEditedAt = new Date('2026-09-17T10:00:00.000Z');

const consultant: Actor = { id: 'consultant-1', role: 'consultant' };
const reviewer: Actor = { id: 'reviewer-1', role: 'reviewer' };

const recommendationId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const clientId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const interactionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

export const ORIGINAL_TITLE = 'Run self-custody readiness discovery';
export const ORIGINAL_SUMMARY =
  'Confirm recovery planning and hardware-wallet controls before moving funds.';
export const ORIGINAL_PRIORITY = 'high' as const;

function draftRecommendationWithStatus(status: RecommendationStatus): Recommendation {
  return {
    id: recommendationId,
    clientId,
    interactionId,
    status,
    title: ORIGINAL_TITLE,
    rationale: 'Recovery planning must be confirmed before funds move off exchange.',
    summary: ORIGINAL_SUMMARY,
    priority: ORIGINAL_PRIORITY,
    createdAt: fixedCreatedAt,
  };
}

export function editRecommendationDraftWorld() {
  const audit = new RecordingAudit();
  let recommendationRepository = new InMemoryRecommendationRepository(
    draftRecommendationWithStatus('draft')
  );
  let transactionManager = new InMemoryRecommendationReviewTransactionManager(
    recommendationRepository,
    audit
  );
  let editDraft = new EditRecommendationDraft({
    recommendationRepository,
    transactionManager,
    now: () => fixedEditedAt,
  });

  const composeFixture = (status: RecommendationStatus) => {
    audit.events.length = 0;
    recommendationRepository = new InMemoryRecommendationRepository(
      draftRecommendationWithStatus(status)
    );
    transactionManager = new InMemoryRecommendationReviewTransactionManager(
      recommendationRepository,
      audit
    );
    editDraft = new EditRecommendationDraft({
      recommendationRepository,
      transactionManager,
      now: () => fixedEditedAt,
    });
  };

  return {
    givenDraftRecommendation() {
      composeFixture('draft');
    },

    givenPendingReviewRecommendation() {
      composeFixture('pending_review');
    },

    editDraft() {
      return editDraft;
    },

    recommendation() {
      const current = recommendationRepository.getCurrent();
      if (!current) {
        throw new Error('recommendation should be set');
      }

      return current;
    },

    audit() {
      return audit;
    },

    failTransactionalAuditRecording() {
      transactionManager.failNextTransactionalAudit();
    },

    consultant() {
      return consultant;
    },

    reviewer() {
      return reviewer;
    },

    fixedEditedAt() {
      return fixedEditedAt;
    },

    clientId() {
      return clientId;
    },

    interactionId() {
      return interactionId;
    },
  };
}
