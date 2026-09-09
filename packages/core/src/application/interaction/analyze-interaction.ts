import type { Interaction } from '../../domain/interaction';
import {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
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

    const { secretScanner, interactionsRepo, structuredLLM, transactionManager } = this.deps;

    const interaction = await interactionsRepo.findById(interactionId);
    if (!interaction) {
      return Result.failure(new InteractionNotFoundError(interactionId));
    }

    if (interaction.status !== 'received') {
      return Result.failure(new InvalidInteractionStateError(interaction.status));
    }

    const scannedResults = await secretScanner.scan({ text: interaction.transcript });
    const prohibitedResults = scannedResults.findings.some((f) => f.severity === 'prohibited');
    if (prohibitedResults) {
      const blockedInteraction: Interaction = { ...interaction, status: 'analysis_blocked' };
      const blockedAuditEvent: AuditEvent = {
        actor,
        action: 'interaction_scan_blocked',
        resource: { type: 'interaction', id: interactionId },
        occurredAt: new Date(),
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

      return Result.success(blockedInteraction);
    }

    try {
      await structuredLLM.extractClientAssessment({
        interactionId: interaction.id,
        transcript: interaction.transcript,
      });
    } catch {
      await this.recordIndependentAudit({
        actor,
        action: 'interaction_analysis_failed',
        resource: { type: 'interaction', id: interactionId },
        occurredAt: new Date(),
        metadata: { failureSource: 'structured_llm' },
      });

      return Result.failure(new InteractionAnalysisFailedError());
    }

    await this.recordIndependentAudit({
      actor,
      action: 'interaction_scan_passed',
      resource: { type: 'interaction', id: interactionId },
      occurredAt: new Date(),
    });

    const updatedInteraction: Interaction = { ...interaction, status: 'analysis_completed' };
    const completedAuditEvent: AuditEvent = {
      actor,
      action: 'interaction_analysis_completed',
      resource: { type: 'interaction', id: interactionId },
      occurredAt: new Date(),
    };

    try {
      await transactionManager.execute(async (tx) => {
        await tx.interactions.save(updatedInteraction);
        await tx.audit.record(completedAuditEvent);
      });
    } catch {
      return Result.failure(new InteractionAnalysisFailedError());
    }
    return Result.success(updatedInteraction);
  }

  private async recordIndependentAudit(event: AuditEvent): Promise<void> {
    try {
      await this.deps.audit.record(event);
    } catch {
      // Best-effort: independent observation audits must not fail the use case.
    }
  }
}
