import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import {
  verifyInteractionFactsWorld,
  type VerifyInteractionFactsResult,
} from '../support/worlds/verifyInteractionFactsWorld';

const feature = await loadFeature('tests/features/verify-interaction-facts.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Reviewer cannot verify interaction facts', ({ Given, When, Then, And }) => {
    const world = verifyInteractionFactsWorld();
    let result: VerifyInteractionFactsResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('an analyzed interaction exists', () => {
      world.givenAnalyzedInteraction();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('the reviewer verifies a fact path', async () => {
      result = await world.verifyFacts().execute({
        actor: world.reviewer(),
        interactionId: world.interactionId(),
        factPaths: ['custody.currentArrangement'],
      });
    });

    Then('unauthorized verify facts failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected unauthorized verify facts failure');
      expect(result.getError().code).toBe('unauthorized_verify_facts');
    });

    And('the verification set is unchanged', () => {
      expect(world.interactionsRepo().getCurrent()?.verifiedFactPaths).toBeUndefined();
    });

    And('no facts verified audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });

  Scenario('Verify with an invalid interaction id fails', ({ Given, When, Then }) => {
    const world = verifyInteractionFactsWorld();
    let result: VerifyInteractionFactsResult;

    Given('an analyzed interaction exists', () => {
      world.givenAnalyzedInteraction();
    });

    When('the consultant verifies with an invalid interaction id', async () => {
      result = await world.verifyFacts().execute({
        actor: world.consultant(),
        interactionId: 'not-a-uuid',
        factPaths: [],
      });
    });

    Then('invalid interaction id failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid interaction id failure');
      expect(result.getError().code).toBe('invalid_interaction_id');
    });
  });

  Scenario('Verify a missing interaction fails', ({ Given, When, Then }) => {
    const world = verifyInteractionFactsWorld();
    let result: VerifyInteractionFactsResult;

    Given('no interaction exists for the requested id', () => {
      world.givenMissingInteraction();
    });

    When('the consultant verifies a fact path', async () => {
      result = await world.verifyFacts().execute({
        actor: world.consultant(),
        interactionId: world.interactionId(),
        factPaths: [],
      });
    });

    Then('interaction not found failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected interaction not found failure');
      expect(result.getError().code).toBe('interaction_not_found');
    });
  });

  Scenario('Verify an interaction that is not analysis completed fails', ({ Given, When, Then }) => {
    const world = verifyInteractionFactsWorld();
    let result: VerifyInteractionFactsResult;

    Given('a received interaction exists', () => {
      world.givenReceivedInteraction();
    });

    When('the consultant verifies a fact path', async () => {
      result = await world.verifyFacts().execute({
        actor: world.consultant(),
        interactionId: world.interactionId(),
        factPaths: ['custody.currentArrangement'],
      });
    });

    Then('invalid interaction state failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid interaction state failure');
      expect(result.getError().code).toBe('invalid_interaction_state');
    });
  });

  Scenario('Verify with an unknown fact path fails', ({ Given, When, Then, And }) => {
    const world = verifyInteractionFactsWorld();
    let result: VerifyInteractionFactsResult;

    Given('an analyzed interaction exists', () => {
      world.givenAnalyzedInteraction();
    });

    When('the consultant verifies a mix of known and unknown fact paths', async () => {
      result = await world.verifyFacts().execute({
        actor: world.consultant(),
        interactionId: world.interactionId(),
        factPaths: ['custody.currentArrangement', 'custody.madeUpField'],
      });
    });

    Then('invalid fact path failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected invalid fact path failure');
      expect(result.getError().code).toBe('invalid_fact_path');
    });

    And('the verification set is unchanged', () => {
      expect(world.interactionsRepo().getCurrent()?.verifiedFactPaths).toBeUndefined();
    });
  });

  Scenario(
    'Consultant saves deduplicated sorted paths and records an audit event',
    ({ Given, When, Then, And }) => {
      const world = verifyInteractionFactsWorld();
      let result: VerifyInteractionFactsResult;
      let auditSpy: ReturnType<typeof vi.spyOn>;

      Given('an analyzed interaction exists', () => {
        world.givenAnalyzedInteraction();
        auditSpy = vi.spyOn(world.audit(), 'record');
      });

      When('the consultant verifies deduplicated fact paths', async () => {
        result = await world.verifyFacts().execute({
          actor: world.consultant(),
          interactionId: world.interactionId(),
          factPaths: [
            'cybersecurity.risks[0]',
            'custody.currentArrangement',
            'custody.currentArrangement',
          ],
        });
      });

      Then('the deduplicated sorted paths are saved', () => {
        expect(result.isSuccess()).toBe(true);
        if (!result.isSuccess()) expect.fail('Expected verification success');
        expect(result.getValue().interaction.verifiedFactPaths).toEqual([
          'custody.currentArrangement',
          'cybersecurity.risks[0]',
        ]);
        expect(world.interactionsRepo().getCurrent()?.verifiedFactPaths).toEqual([
          'custody.currentArrangement',
          'cybersecurity.risks[0]',
        ]);
      });

      And('a facts verified audit event is recorded', () => {
        expect(auditSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            actor: world.consultant(),
            action: 'interaction_facts_verified',
            resource: { type: 'interaction', id: world.interactionId() },
            metadata: { factPathCount: 2 },
          })
        );
        expect(world.audit().events).toEqual([
          expect.objectContaining({
            action: 'interaction_facts_verified',
            resource: { type: 'interaction', id: world.interactionId() },
            metadata: { factPathCount: 2 },
          }),
        ]);
      });
    }
  );

  Scenario(
    'Consultant replaces the previous verification set, including clearing it',
    ({ Given, When, Then }) => {
      const world = verifyInteractionFactsWorld();
      let result: VerifyInteractionFactsResult;

      Given('an analyzed interaction with a verified fact exists', () => {
        world.givenAnalyzedInteractionWithVerifiedFact();
      });

      When('the consultant clears the verification set', async () => {
        result = await world.verifyFacts().execute({
          actor: world.consultant(),
          interactionId: world.interactionId(),
          factPaths: [],
        });
      });

      Then('the verification set is empty', () => {
        expect(result.isSuccess()).toBe(true);
        if (!result.isSuccess()) expect.fail('Expected verification success');
        expect(result.getValue().interaction.verifiedFactPaths).toEqual([]);
        expect(world.interactionsRepo().getCurrent()?.verifiedFactPaths).toEqual([]);
      });
    }
  );

  Scenario('Verify rolls back when audit recording fails', ({ Given, And, When, Then }) => {
    const world = verifyInteractionFactsWorld();
    let result: VerifyInteractionFactsResult;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('an analyzed interaction exists', () => {
      world.givenAnalyzedInteraction();
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    And('transactional audit recording fails', () => {
      world.failTransactionalAuditRecording();
    });

    When('the consultant verifies a fact path', async () => {
      result = await world.verifyFacts().execute({
        actor: world.consultant(),
        interactionId: world.interactionId(),
        factPaths: ['custody.currentArrangement'],
      });
    });

    Then('fact verification failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected verification failure');
      expect(result.getError().code).toBe('fact_verification_failed');
    });

    And('the verification set is unchanged', () => {
      expect(world.interactionsRepo().getCurrent()?.verifiedFactPaths).toBeUndefined();
    });

    And('no facts verified audit event is recorded', () => {
      expect(auditSpy).not.toHaveBeenCalled();
      expect(world.audit().events).toEqual([]);
    });
  });
});
