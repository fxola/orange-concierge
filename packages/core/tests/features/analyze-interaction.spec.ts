import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import {
  InteractionAnalysisFailedError,
  InvalidInteractionStateError,
  type AnalyzeInteractionResult,
} from '../../src';
import { analyzeInteractionWorld } from '../support/worlds/analyzeInteractionWorld';

const feature = await loadFeature('tests/features/analyze-interaction.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Block prohibited secrets before model invocation', ({ Given, When, Then, And }) => {
    const world = analyzeInteractionWorld();
    let scanSpy: ReturnType<typeof vi.spyOn>;
    let extractSpy: ReturnType<typeof vi.spyOn>;
    let auditSpy: ReturnType<typeof vi.spyOn>;

    Given('a received interaction containing a prohibited secret', () => {
      world.givenReceivedInteractionContainingProhibitedSecret();
      scanSpy = vi.spyOn(world.secretScanner(), 'scan');
      extractSpy = vi.spyOn(world.structuredLLM(), 'extractClientAssessment');
      auditSpy = vi.spyOn(world.audit(), 'record');
    });

    When('a consultant analyzes the interaction', async () => {
      const result = await world.analyzeInteraction().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
      expect(result.isSuccess()).toBe(true);
    });

    Then('the secret scanner runs before any structured LLM call', () => {
      expect(scanSpy).toHaveBeenCalledTimes(1);
      expect(world.operations()[0]).toBe('scan');
    });

    And('the structured LLM is not invoked', () => {
      expect(extractSpy).not.toHaveBeenCalled();
      expect(world.structuredLLM().inputs).toHaveLength(0);
    });

    And('the interaction is marked analysis blocked', () => {
      expect(world.interaction().status).toBe('analysis_blocked');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'interaction_scan_blocked',
          actor: world.consultant(),
          resource: {
            id: world.interaction().id,
            type: 'interaction',
          },
          metadata: { findingCount: 1 },
        })
      );
    });

    And('the blocked audit event does not include transcript content', () => {
      expect(auditSpy).toHaveBeenCalledTimes(1);
      expect(
        world.audit().events.some((event) => event.action === 'interaction_scan_blocked')
      ).toBe(true);
      expect(JSON.stringify(world.audit().events)).not.toContain(world.interaction().transcript);
    });
  });

  Scenario('Complete analysis for a safe received interaction', ({ Given, When, Then, And }) => {
    const world = analyzeInteractionWorld();
    let result: AnalyzeInteractionResult;
    let scanSpy: ReturnType<typeof vi.spyOn>;
    let extractSpy: ReturnType<typeof vi.spyOn>;

    Given('a received interaction with safe transcript', () => {
      world.givenReceivedInteractionWithSafeTranscript();
      scanSpy = vi.spyOn(world.secretScanner(), 'scan');
      extractSpy = vi.spyOn(world.structuredLLM(), 'extractClientAssessment');
    });

    When('a consultant analyzes the interaction', async () => {
      result = await world.analyzeInteraction().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
      expect(result.isSuccess()).toBe(true);
    });

    Then('the secret scanner runs before the structured LLM', () => {
      expect(scanSpy).toHaveBeenCalledTimes(1);
      expect(world.operations().slice(0, 2)).toEqual(['scan', 'llm']);
    });

    And('the structured LLM receives the interaction transcript', () => {
      expect(extractSpy).toHaveBeenCalledWith({
        interactionId: world.interaction().id,
        transcript: world.interaction().transcript,
      });
    });

    And('the interaction is marked analysis completed', () => {
      expect(world.interaction().status).toBe('analysis_completed');
      expect(world.audit().events).toHaveLength(2);
      expect(world.audit().events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'interaction_scan_passed',
          }),
          expect.objectContaining({
            action: 'interaction_analysis_completed',
          }),
        ])
      );
    });

    And('typed assessment facts are returned', () => {
      if (!result.isSuccess()) expect.fail('Expected analysis success');
      expect(result.getValue()).toEqual({
        interaction: expect.objectContaining({
          id: world.interaction().id,
          status: 'analysis_completed',
        }),
        extractedFacts: {
          custody: {
            currentArrangement: 'Client holds bitcoin on Coinbase.',
            concerns: ['Wants to move funds off exchange'],
          },
          cybersecurity: {
            controls: ['Uses hardware wallet'],
          },
          planning: {
            goals: ['Learn safe self-custody'],
          },
        },
      });
    });

    And('the analysis audit events do not include transcript content', () => {
      expect(JSON.stringify(world.audit().events)).not.toContain(world.interaction().transcript);
    });
  });

  Scenario(
    'Fail transactionally when audit recording fails during completion',
    ({ Given, When, Then, And }) => {
      const world = analyzeInteractionWorld();
      let result: AnalyzeInteractionResult;

      Given('a received interaction with safe transcript', () => {
        world.givenReceivedInteractionWithSafeTranscript();
      });

      And('transactional audit recording fails', () => {
        world.failTransactionalAuditRecording();
      });

      When('a consultant analyzes the interaction', async () => {
        result = await world.analyzeInteraction().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('the analysis fails', () => {
        expect(result.isFailure()).toBe(true);
        if (!result.isFailure()) expect.fail('Expected analysis failure');
        expect(result.getError()).toBeInstanceOf(InteractionAnalysisFailedError);
      });

      And('the interaction remains received with only scan passed audit', () => {
        expect(world.interaction().status).toBe('received');
        expect(world.audit().events).toHaveLength(1);
        expect(world.audit().events).toContainEqual(
          expect.objectContaining({ action: 'interaction_scan_passed' })
        );
        expect(world.audit().events).not.toContainEqual(
          expect.objectContaining({ action: 'interaction_analysis_completed' })
        );
      });
    }
  );

  Scenario(
    'Fail transactionally when audit recording fails during blocking',
    ({ Given, When, Then, And }) => {
      const world = analyzeInteractionWorld();
      let result: AnalyzeInteractionResult;

      Given('a received interaction containing a prohibited secret', () => {
        world.givenReceivedInteractionContainingProhibitedSecret();
      });

      And('transactional audit recording fails', () => {
        world.failTransactionalAuditRecording();
      });

      When('a consultant analyzes the interaction', async () => {
        result = await world.analyzeInteraction().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('the analysis fails', () => {
        expect(result.isFailure()).toBe(true);
        if (!result.isFailure()) expect.fail('Expected analysis failure');
        expect(result.getError()).toBeInstanceOf(InteractionAnalysisFailedError);
      });

      And('the interaction remains received without audit events', () => {
        expect(world.interaction().status).toBe('received');
        expect(world.audit().events).toHaveLength(0);
      });
    }
  );

  Scenario('Succeed when independent scan passed audit fails', ({ Given, When, Then, And }) => {
    const world = analyzeInteractionWorld();
    let result: AnalyzeInteractionResult;

    Given('a received interaction with safe transcript', () => {
      world.givenReceivedInteractionWithSafeTranscript();
    });

    And('independent audit recording fails once', () => {
      world.audit().failNextRecording();
    });

    When('a consultant analyzes the interaction', async () => {
      result = await world.analyzeInteraction().execute({
        actor: world.consultant(),
        interactionId: world.interaction().id,
      });
    });

    Then('the analysis succeeds with completed audit and without scan passed audit', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.interaction().status).toBe('analysis_completed');
      expect(world.audit().events).toContainEqual(
        expect.objectContaining({ action: 'interaction_analysis_completed' })
      );
      expect(world.audit().events).not.toContainEqual(
        expect.objectContaining({ action: 'interaction_scan_passed' })
      );
    });
  });

  Scenario(
    'Record model failure without leaking transcript content',
    ({ Given, When, Then, And }) => {
      const world = analyzeInteractionWorld();
      let result: AnalyzeInteractionResult;
      let auditSpy: ReturnType<typeof vi.spyOn>;

      Given('a received interaction with safe transcript', () => {
        world.givenReceivedInteractionWithSafeTranscript();
        auditSpy = vi.spyOn(world.audit(), 'record');
      });

      And('the structured LLM fails during extraction', () => {
        world.structuredLLM().failNextExtraction();
      });

      When('a consultant analyzes the interaction', async () => {
        result = await world.analyzeInteraction().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('the interaction is not marked analysis completed', () => {
        expect(world.interaction().status).toBe('received');
        if (!result.isFailure()) expect.fail('Expected analysis failure');
        expect(result.getError()).toBeInstanceOf(InteractionAnalysisFailedError);
      });

      And('an analysis failed audit event is recorded without transcript content', () => {
        expect(auditSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'interaction_analysis_failed',
            actor: world.consultant(),
            resource: {
              id: world.interaction().id,
              type: 'interaction',
            },
          })
        );
        expect(JSON.stringify(world.audit().events)).not.toContain(world.interaction().transcript);
      });
    }
  );

  Scenario(
    'Reject invalid structured LLM response without completing analysis',
    ({ Given, When, Then, And }) => {
      const world = analyzeInteractionWorld();
      let result: AnalyzeInteractionResult;
      let auditSpy: ReturnType<typeof vi.spyOn>;

      Given('a received interaction with safe transcript', () => {
        world.givenReceivedInteractionWithSafeTranscript();
        auditSpy = vi.spyOn(world.audit(), 'record');
      });

      And('the structured LLM reports an invalid response', () => {
        world.structuredLLM().failNextExtraction('invalid_response');
      });

      When('a consultant analyzes the interaction', async () => {
        result = await world.analyzeInteraction().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('the interaction is not marked analysis completed', () => {
        expect(world.interaction().status).toBe('received');
        if (!result.isFailure()) expect.fail('Expected analysis failure');
        expect(result.getError()).toBeInstanceOf(InteractionAnalysisFailedError);
      });

      And('an analysis failed audit event is recorded without transcript content', () => {
        expect(auditSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'interaction_analysis_failed',
            actor: world.consultant(),
            resource: {
              id: world.interaction().id,
              type: 'interaction',
            },
            metadata: { failureSource: 'structured_llm', failureReason: 'invalid_response' },
          })
        );
        expect(JSON.stringify(world.audit().events)).not.toContain(world.interaction().transcript);
      });
    }
  );

  Scenario(
    'Refuse to re-analyze an interaction that is not received',
    ({ Given, When, Then, And }) => {
      const world = analyzeInteractionWorld();
      let result: AnalyzeInteractionResult;
      let scanSpy: ReturnType<typeof vi.spyOn>;
      let extractSpy: ReturnType<typeof vi.spyOn>;

      Given('an interaction that is already analysis completed', () => {
        world.givenInteractionThatIsAlreadyAnalysisCompleted();
        scanSpy = vi.spyOn(world.secretScanner(), 'scan');
        extractSpy = vi.spyOn(world.structuredLLM(), 'extractClientAssessment');
      });

      When('a consultant analyzes the interaction', async () => {
        result = await world.analyzeInteraction().execute({
          actor: world.consultant(),
          interactionId: world.interaction().id,
        });
      });

      Then('the analysis is rejected as an invalid interaction state', () => {
        if (!result.isFailure()) expect.fail('Expected interaction state failure');
        expect(result.getError()).toBeInstanceOf(InvalidInteractionStateError);
      });

      And('the secret scanner is not invoked', () => {
        expect(scanSpy).not.toHaveBeenCalled();
      });

      And('the structured LLM is not invoked', () => {
        expect(extractSpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario.skip('Reject an actor who cannot analyze interactions', ({ Given, When, Then, And }) => {
    Given('a received interaction with safe transcript', () => {});

    When('a reviewer analyzes the interaction', () => {});

    Then('the analysis is rejected as unauthorized', () => {});

    And('the secret scanner is not invoked', () => {});

    And('the structured LLM is not invoked', () => {});

    And('no audit event includes transcript content', () => {});
  });

  Scenario.skip(
    'Report a missing interaction without side effects',
    ({ Given, When, Then, And }) => {
      Given('no interaction exists for the requested id', () => {});

      When('a consultant analyzes the interaction', () => {});

      Then('the analysis is rejected as interaction not found', () => {});

      And('the secret scanner is not invoked', () => {});

      And('the structured LLM is not invoked', () => {});

      And('no audit event is recorded', () => {});
    }
  );

  Scenario.skip(
    'Complete analysis when the scanner returns warnings only',
    ({ Given, When, Then, And }) => {
      Given('a received interaction with warning-only scanner findings', () => {});

      When('a consultant analyzes the interaction', () => {});

      Then('the structured LLM is invoked', () => {});

      And('the interaction is marked analysis completed', () => {});

      And('the audit events include warning counts without transcript content', () => {});
    }
  );
});
