import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import type { SubmitInteractionResult } from '../../src';
import { submitInteractionWorld } from '../support/worlds/submitInteractionWorld';

const feature = await loadFeature('tests/features/submit-interaction.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Consultant submits meeting notes', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    When('the consultant submits meeting notes for a client', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: world.clientId(),
        transcript: world.meetingNotes(),
      });
    });

    Then('a received interaction is saved', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.savedInteraction().status).toBe('received');
      expect(world.savedInteraction().transcript).toBe(world.meetingNotes());
    });

    And('the interaction belongs to the client', () => {
      expect(world.savedInteraction().clientId).toBe(world.clientId());
    });

    And('the interaction was submitted by the consultant', () => {
      expect(world.savedInteraction().submittedBy).toBe(world.consultant().id);
    });

    And('an interaction submitted audit event is recorded', () => {
      expect(world.audit().events).toContainEqual(
        expect.objectContaining({
          actor: world.consultant(),
          action: 'interaction_submitted',
          resource: { type: 'interaction', id: world.savedInteraction().id },
          metadata: { clientId: world.clientId() },
        })
      );
    });

    And('the audit event does not include transcript content', () => {
      expect(JSON.stringify(world.audit().events)).not.toContain(world.meetingNotes());
    });
  });

  Scenario('Reject blank transcript without side effects', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    When('the consultant submits blank meeting notes for a client', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: world.clientId(),
        transcript: world.blankTranscript(),
      });
    });

    Then('the submission is rejected as blank transcript', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('BlankTranscriptError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
    });

    And('no audit event is recorded', () => {
      expect(world.audit().events).toHaveLength(0);
    });
  });

  Scenario('Reject whitespace-only transcript as blank', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    When('the consultant submits whitespace-only meeting notes for a client', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: world.clientId(),
        transcript: world.whitespaceTranscript(),
      });
    });

    Then('the submission is rejected as blank transcript', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('BlankTranscriptError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
    });

    And('no audit event is recorded', () => {
      expect(world.audit().events).toHaveLength(0);
    });
  });

  Scenario('Reject unauthorized submitter without side effects', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;

    Given('a reviewer actor', () => {
      expect(world.reviewer().role).toBe('reviewer');
    });

    When('the reviewer submits meeting notes for a client', async () => {
      result = await world.submitInteraction().execute({
        actor: world.reviewer(),
        clientId: world.clientId(),
        transcript: world.meetingNotes(),
      });
    });

    Then('the submission is rejected as unauthorized', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('UnauthorizedSubmitInteractionError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
    });

    And('no audit event is recorded', () => {
      expect(world.audit().events).toHaveLength(0);
    });
  });

  Scenario('Fail transactionally when audit recording fails', ({ Given, And, When, Then }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    And('audit recording fails', () => {
      world.failAuditRecording();
    });

    When('the consultant submits meeting notes for a client', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: world.clientId(),
        transcript: world.meetingNotes(),
      });
    });

    Then('the submission is rejected as submission failed', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('InteractionSubmissionFailedError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
      expect(world.audit().events).toHaveLength(0);
    });
  });

  Scenario('Reject unknown client without side effects', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    When('the consultant submits meeting notes for an unknown client', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        transcript: world.meetingNotes(),
      });
    });

    Then('the submission is rejected as unknown client', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('ClientNotFoundError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
    });

    And('no audit event is recorded', () => {
      expect(world.audit().events).toHaveLength(0);
    });
  });

  Scenario('Reject blank client id without side effects', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;
    let existsSpy: ReturnType<typeof vi.spyOn>;
    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
      existsSpy = vi.spyOn(world.clientRepository(), 'exists');
    });

    When('the consultant submits meeting notes for a blank client id', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: '   ',
        transcript: world.meetingNotes(),
      });
    });

    Then('the submission is rejected as invalid client id', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('InvalidClientIdError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
      expect(existsSpy).not.toHaveBeenCalled();
    });

    And('no audit event is recorded', () => {
      expect(world.audit().events).toHaveLength(0);
    });
  });

  Scenario('Reject overlong client id without side effects', ({ Given, When, Then, And }) => {
    const world = submitInteractionWorld();
    let result: SubmitInteractionResult;
    let existsSpy: ReturnType<typeof vi.spyOn>;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
      existsSpy = vi.spyOn(world.clientRepository(), 'exists');
    });

    When('the consultant submits meeting notes for an overlong client id', async () => {
      result = await world.submitInteraction().execute({
        actor: world.consultant(),
        clientId: `client-${'x'.repeat(128)}`,
        transcript: world.meetingNotes(),
      });
    });

    Then('the submission is rejected as invalid client id', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('InvalidClientIdError');
    });

    And('no interaction is saved', () => {
      expect(world.interactions()).toHaveLength(0);
      expect(existsSpy).not.toHaveBeenCalled();
    });

    And('no audit event is recorded', () => {
      expect(world.audit().events).toHaveLength(0);
    });
  });
});
