import { parseInteractionId, type Interaction } from '../../domain/interaction';
import {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidInteractionIdError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
} from '../../errors';
import type { AuditEvent } from '../../ports/audit';
import { canAnalyzeInteractions } from './policy';
import { Result } from '../result';
import type {
  AnalyzeInteractionDependencies,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
} from './types';

export class AnalyzeInteraction {
  constructor(private readonly deps: AnalyzeInteractionDependencies) {}

  async execute(input: AnalyzeInteractionInput): Promise<AnalyzeInteractionResult> {
    const { actor, interactionId } = input;

    if (!canAnalyzeInteractions(input.actor)) {
      return Result.failure(new UnauthorizedAnalyzeInteractionError(actor.role));
    }

    const parsedInteractionId = parseInteractionId(interactionId);
    if (!parsedInteractionId.ok) {
      return Result.failure(new InvalidInteractionIdError());
    }

    const { secretScanner, interactionsRepo, structuredLLM, transactionManager, now } = this.deps;

    const interaction = await interactionsRepo.findById(parsedInteractionId.interactionId);
    if (!interaction) {
      return Result.failure(new InteractionNotFoundError(parsedInteractionId.interactionId));
    }

    if (interaction.status !== 'received') {
      return Result.failure(new InvalidInteractionStateError(interaction.status));
    }

    const { transcript } = interaction;
    const scannedResults = secretScanner.scan({ text: transcript });
    const prohibitedResults = scannedResults.findings.some((f) => f.severity === 'prohibited');
    if (prohibitedResults) {
      const blockedInteraction: Interaction = { ...interaction, status: 'analysis_blocked' };
      const blockedAuditEvent: AuditEvent = {
        actor,
        action: 'interaction_scan_blocked',
        resource: { type: 'interaction', id: parsedInteractionId.interactionId },
        occurredAt: now(),
        metadata: {
          findingCount: scannedResults.findings.length,
        },
      };

      try {
        await transactionManager.execute(async (tx) => {
          await tx.interactions.save(blockedInteraction);
          await tx.audit.record(blockedAuditEvent);
        });
      } catch {
        return Result.failure(new InteractionAnalysisFailedError());
      }

      return Result.success({ interaction: blockedInteraction });
    }

    const assessmentResult = await structuredLLM.extractClientAssessment({
      interactionId: parsedInteractionId.interactionId,
      transcript,
    });

    if (assessmentResult.isFailure()) {
      await this.recordIndependentAudit({
        actor,
        action: 'interaction_analysis_failed',
        resource: { type: 'interaction', id: parsedInteractionId.interactionId },
        occurredAt: now(),
        metadata: { failureSource: 'structured_llm', failureReason: assessmentResult.getError() },
      });

      return Result.failure(new InteractionAnalysisFailedError());
    }

    const extractedFacts = assessmentResult.getValue();

    await this.recordIndependentAudit({
      actor,
      action: 'interaction_scan_passed',
      resource: { type: 'interaction', id: parsedInteractionId.interactionId },
      occurredAt: now(),
    });

    const updatedInteraction: Interaction = {
      ...interaction,
      status: 'analysis_completed',
      extractedFacts,
    };
    const completedAuditEvent: AuditEvent = {
      actor,
      action: 'interaction_analysis_completed',
      resource: { type: 'interaction', id: parsedInteractionId.interactionId },
      occurredAt: now(),
    };

    try {
      await transactionManager.execute(async (tx) => {
        await tx.interactions.save(updatedInteraction);
        await tx.audit.record(completedAuditEvent);
      });
    } catch {
      return Result.failure(new InteractionAnalysisFailedError());
    }
    return Result.success({ interaction: updatedInteraction, extractedFacts });
  }

  private async recordIndependentAudit(event: AuditEvent): Promise<void> {
    try {
      await this.deps.audit.record(event);
    } catch {
      // Best-effort: independent observation audits must not fail the use case.
    }
  }
}
