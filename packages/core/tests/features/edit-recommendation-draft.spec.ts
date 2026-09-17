import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import {
  ORIGINAL_PRIORITY,
  ORIGINAL_SUMMARY,
  ORIGINAL_TITLE,
  editRecommendationDraftWorld,
  type EditRecommendationDraftResult,
} from '../support/worlds/editRecommendationDraftWorld';

const feature = await loadFeature('tests/features/edit-recommendation-draft.feature');

const editedTitle = 'Confirm hardware-wallet backup before moving funds';
const editedSummary = 'Backup must be verified because recovery planning is incomplete.';
const editedPriority = 'medium' as const;
const missingRecommendationId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

describeFeature(feature, ({ Scenario }) => {
  Scenario('Consultant edits a draft recommendation', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant edits the draft title, summary, and priority', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
        patch: { title: editedTitle, summary: editedSummary, priority: editedPriority },
      });
    });

    Then('the draft keeps draft status', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.recommendation().status).toBe('draft');
    });

    And('the edited title, summary, and priority are saved', () => {
      expect(world.recommendation().title).toBe(editedTitle);
      expect(world.recommendation().summary).toBe(editedSummary);
      expect(world.recommendation().priority).toBe(editedPriority);
    });

    And('a recommendation edited audit event is recorded without sensitive text', () => {
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: world.consultant(),
          action: 'recommendation_edited',
          resource: { type: 'recommendation', id: world.recommendation().id },
          occurredAt: world.fixedEditedAt(),
          metadata: expect.objectContaining({
            interactionId: world.interactionId(),
            clientId: world.clientId(),
            changedFields: 'title,summary,priority',
          }),
        })
      );
      const [event] = world.audit().events;
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(editedTitle);
      expect(JSON.stringify(event?.metadata ?? {})).not.toContain(editedSummary);
    });
  });

  Scenario('Reviewer cannot edit a draft recommendation', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the reviewer edits the draft title', async () => {
      result = await world.editDraft().execute({
        actor: world.reviewer(),
        recommendationId: world.recommendation().id,
        patch: { title: 'Reviewer rewrite attempt' },
      });
    });

    Then('unauthorized recommendation edit failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected unauthorized edit failure');
      expect(result.getError().code).toBe('unauthorized_recommendation_edit');
    });

    And('the draft title, summary, and priority are unchanged', () => {
      expect(world.recommendation().title).toBe(ORIGINAL_TITLE);
      expect(world.recommendation().summary).toBe(ORIGINAL_SUMMARY);
      expect(world.recommendation().priority).toBe(ORIGINAL_PRIORITY);
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Pending recommendation cannot be edited', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a pending review recommendation exists', () => {
      world.givenPendingReviewRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant edits the draft title', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
        patch: { title: 'Late rewrite attempt' },
      });
    });

    Then('invalid recommendation transition failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid transition failure');
      expect(result.getError().code).toBe('invalid_recommendation_transition');
    });

    And('the recommendation remains pending review', () => {
      expect(world.recommendation().status).toBe('pending_review');
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Edit with an invalid recommendation id fails', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant edits with an invalid recommendation id', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: 'not-a-uuid',
        patch: { title: 'Rewrite attempt' },
      });
    });

    Then('invalid recommendation id failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid id failure');
      expect(result.getError().code).toBe('invalid_recommendation_id');
    });

    And('the draft title, summary, and priority are unchanged', () => {
      expect(world.recommendation().title).toBe(ORIGINAL_TITLE);
      expect(world.recommendation().summary).toBe(ORIGINAL_SUMMARY);
      expect(world.recommendation().priority).toBe(ORIGINAL_PRIORITY);
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Edit of a missing recommendation fails', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant edits a missing recommendation', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: missingRecommendationId,
        patch: { title: 'Rewrite attempt' },
      });
    });

    Then('recommendation not found failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected not found failure');
      expect(result.getError().code).toBe('recommendation_not_found');
    });

    And('the draft title, summary, and priority are unchanged', () => {
      expect(world.recommendation().title).toBe(ORIGINAL_TITLE);
      expect(world.recommendation().summary).toBe(ORIGINAL_SUMMARY);
      expect(world.recommendation().priority).toBe(ORIGINAL_PRIORITY);
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Edit with a blank title fails', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant edits the draft with a blank title', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
        patch: { title: '   ' },
      });
    });

    Then('invalid recommendation edit failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid edit failure');
      expect(result.getError().code).toBe('invalid_recommendation_edit');
    });

    And('the draft title, summary, and priority are unchanged', () => {
      expect(world.recommendation().title).toBe(ORIGINAL_TITLE);
      expect(world.recommendation().summary).toBe(ORIGINAL_SUMMARY);
      expect(world.recommendation().priority).toBe(ORIGINAL_PRIORITY);
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Edit with an over-length summary fails', ({ Given, When, Then, And }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the consultant edits the draft with an over-length summary', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
        patch: { summary: 'x'.repeat(181) },
      });
    });

    Then('invalid recommendation edit failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid edit failure');
      expect(result.getError().code).toBe('invalid_recommendation_edit');
    });

    And('the draft title, summary, and priority are unchanged', () => {
      expect(world.recommendation().title).toBe(ORIGINAL_TITLE);
      expect(world.recommendation().summary).toBe(ORIGINAL_SUMMARY);
      expect(world.recommendation().priority).toBe(ORIGINAL_PRIORITY);
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Edit rolls back when audit recording fails', ({ Given, And, When, Then }) => {
    const world = editRecommendationDraftWorld();
    let result: EditRecommendationDraftResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a draft recommendation exists', () => {
      world.givenDraftRecommendation();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    And('transactional audit recording fails', () => {
      world.failTransactionalAuditRecording();
    });

    When('the consultant edits the draft title, summary, and priority', async () => {
      result = await world.editDraft().execute({
        actor: world.consultant(),
        recommendationId: world.recommendation().id,
        patch: { title: editedTitle, summary: editedSummary, priority: editedPriority },
      });
    });

    Then('recommendation edit failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected edit failure');
      expect(result.getError().code).toBe('recommendation_edit_failed');
    });

    And('the draft title, summary, and priority are unchanged', () => {
      expect(world.recommendation().title).toBe(ORIGINAL_TITLE);
      expect(world.recommendation().summary).toBe(ORIGINAL_SUMMARY);
      expect(world.recommendation().priority).toBe(ORIGINAL_PRIORITY);
    });

    And('no recommendation edited audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });
});
