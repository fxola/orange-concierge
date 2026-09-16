import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import {
  reviewRecommendationWorld,
  type ReviewRecommendationResult,
  type SubmitRecommendationForReviewResult,
} from '../support/worlds/reviewRecommendationWorld';

const feature = await loadFeature('tests/features/review-recommendation.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Consultant submits a draft recommendation for review', ({ Given, When, Then, And }) => {
    const world = reviewRecommendationWorld();
    let result: SubmitRecommendationForReviewResult;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
    });

    When('the consultant submits the recommendation for review', async () => {
      result = await world.submitRecommendationForReview().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
      });
    });

    Then('the recommendation becomes pending review', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.recommendation().status).toBe('pending_review');
    });

    And('no reviewer identity is recorded', () => {
      expect(world.recommendation().reviewerId).toBeUndefined();
      expect(world.recommendation().reviewedAt).toBeUndefined();
    });
  });

  Scenario('Consultant cannot approve a pending recommendation', ({ Given, When, Then, And }) => {
    const world = reviewRecommendationWorld();
    let result: ReviewRecommendationResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a pending review recommendation exists', () => {
      world.givenPendingReviewRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant approves the recommendation', async () => {
      result = await world.reviewRecommendation().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
        decision: 'approved',
      });
    });

    Then('unauthorized recommendation review failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected recommendation review failure');
      expect(result.getError().code).toBe('unauthorized_recommendation_review');
    });

    And('the recommendation remains pending review', () => {
      expect(world.recommendation().status).toBe('pending_review');
    });

    And('no recommendation reviewed audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Reviewer approves a pending recommendation', ({ Given, When, Then, And }) => {
    const world = reviewRecommendationWorld();
    let result: ReviewRecommendationResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a pending review recommendation exists', () => {
      world.givenPendingReviewRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the reviewer approves the recommendation', async () => {
      result = await world.reviewRecommendation().execute({
        actor: world.reviewer(),
        recommendationId: world.recommendation().id,
        decision: 'approved',
      });
    });

    Then('the recommendation is approved', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.recommendation().status).toBe('approved');
    });

    And('the reviewer identity and review timestamp are recorded', () => {
      expect(world.recommendation().reviewerId).toBe(world.reviewer().id);
      expect(world.recommendation().reviewedAt).toEqual(world.fixedReviewedAt());
    });

    And('a recommendation reviewed audit event is recorded without sensitive text', () => {
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: world.reviewer(),
          action: 'recommendation_reviewed',
          resource: { type: 'recommendation', id: world.recommendation().id },
          occurredAt: world.fixedReviewedAt(),
          metadata: expect.objectContaining({
            previousStatus: 'pending_review',
            newStatus: 'approved',
            interactionId: world.interactionId(),
            clientId: world.clientId(),
          }),
        })
      );
      const [event] = world.audit().events;

      expect(event).toMatchObject({
        actor: world.reviewer(),
        action: 'recommendation_reviewed',
        resource: { type: 'recommendation', id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' },
        occurredAt: world.fixedReviewedAt(),
        metadata: {
          previousStatus: 'pending_review',
          newStatus: 'approved',
          interactionId: world.interactionId(),
          clientId: world.clientId(),
        },
      });
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(
        world.sensitiveRecommendationText()[0]
      );
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(
        world.sensitiveRecommendationText()[1]
      );
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(
        world.sensitiveRecommendationText()[2]
      );
    });
  });

  Scenario(
    'Review approval rolls back when audit recording fails',
    ({ Given, And, When, Then }) => {
      const world = reviewRecommendationWorld();
      let result: ReviewRecommendationResult;
      let auditSpy: ReturnType<typeof vi.spyOn>;

      Given('a pending review recommendation exists', () => {
        world.givenPendingReviewRecommendation();
        auditSpy = vi.spyOn(world.audit(), 'record');
      });

      And('transactional audit recording fails', () => {
        world.failTransactionalAuditRecording();
      });

      When('the reviewer approves the recommendation', async () => {
        result = await world.reviewRecommendation().execute({
          actor: world.reviewer(),
          recommendationId: world.recommendation().id,
          decision: 'approved',
        });
      });

      Then('recommendation review failure is returned', () => {
        expect(result.isFailure()).toBe(true);
        if (!result.isFailure()) expect.fail('Expected recommendation review failure');
        expect(result.getError().code).toBe('recommendation_review_failed');
      });

      And('the recommendation remains pending review', () => {
        expect(world.recommendation().status).toBe('pending_review');
      });

      And('no recommendation reviewed audit event is recorded', () => {
        expect(auditSpy).not.toHaveBeenCalled();
        expect(world.audit().events).toEqual([]);
      });
    }
  );

  Scenario('Reviewer rejects a pending recommendation', ({ Given, When, Then, And }) => {
    const world = reviewRecommendationWorld();
    let result: ReviewRecommendationResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a pending review recommendation exists', () => {
      world.givenPendingReviewRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the reviewer rejects the recommendation', async () => {
      result = await world.reviewRecommendation().execute({
        actor: world.reviewer(),
        recommendationId: world.recommendation().id,
        decision: 'rejected',
      });
    });

    Then('the recommendation is rejected', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.recommendation().status).toBe('rejected');
    });

    And('the reviewer identity and review timestamp are recorded', () => {
      expect(world.recommendation().reviewerId).toBe(world.reviewer().id);
      expect(world.recommendation().reviewedAt).toEqual(world.fixedReviewedAt());
    });

    And('a recommendation reviewed audit event is recorded without sensitive text', () => {
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: world.reviewer(),
          action: 'recommendation_reviewed',
          resource: { type: 'recommendation', id: world.recommendation().id },
          occurredAt: world.fixedReviewedAt(),
          metadata: expect.objectContaining({
            previousStatus: 'pending_review',
            newStatus: 'rejected',
            interactionId: world.interactionId(),
            clientId: world.clientId(),
          }),
        })
      );
      const [event] = world.audit().events;

      expect(event).toMatchObject({
        actor: world.reviewer(),
        action: 'recommendation_reviewed',
        resource: { type: 'recommendation', id: world.recommendation().id },
        occurredAt: world.fixedReviewedAt(),
        metadata: {
          previousStatus: 'pending_review',
          newStatus: 'rejected',
          interactionId: world.interactionId(),
          clientId: world.clientId(),
        },
      });
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(
        world.sensitiveRecommendationText()[0]
      );
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(
        world.sensitiveRecommendationText()[1]
      );
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(
        world.sensitiveRecommendationText()[2]
      );
    });
  });

  Scenario('Draft recommendation cannot be approved directly', ({ Given, When, Then, And }) => {
    const world = reviewRecommendationWorld();
    let result: ReviewRecommendationResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the reviewer approves the recommendation', async () => {
      result = await world.reviewRecommendation().execute({
        actor: world.reviewer(),
        recommendationId: world.recommendation().id,
        decision: 'approved',
      });
    });

    Then('invalid recommendation transition failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid recommendation transition');
      expect(result.getError().code).toBe('invalid_recommendation_transition');
    });

    And('the recommendation remains draft', () => {
      expect(world.recommendation().status).toBe('draft');
    });

    And('no recommendation reviewed audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });
});
