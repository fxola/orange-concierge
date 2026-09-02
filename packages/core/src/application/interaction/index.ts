import { Interaction } from '../../domain/interaction';
import {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
} from '../../errors';
import type { AuditEvent } from '../../ports/audit';
import { canAnalyzeInteractions } from './policy';
import {
  AnalyzeInteractionDependencies,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  Result,
} from './types';

export class AnalyzeInteraction {
  constructor(private readonly dependencies: AnalyzeInteractionDependencies) {}

  async execute(input: AnalyzeInteractionInput): Promise<AnalyzeInteractionResult> {
    const { actor, interactionId } = input;

    if (!canAnalyzeInteractions(input.actor)) {
      return Result.failure(new UnauthorizedAnalyzeInteractionError(actor.role));
    }

    const { secretScanner, interactionsRepo, structuredLLM } = this.dependencies;

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
      await interactionsRepo.save(blockedInteraction);
      await this.recordAudit({
        actor,
        action: 'interaction_scan_blocked',
        resource: { type: 'interaction', id: interactionId },
        occurredAt: new Date(),
        metadata: {
          findingCount: scannedResults.findings.length,
        },
      });

      return Result.success(blockedInteraction);
    }

    try {
      await structuredLLM.extractClientAssessment({
        interactionId: interaction.id,
        transcript: interaction.transcript,
      });
    } catch {
      await this.recordAudit({
        actor,
        action: 'interaction_analysis_failed',
        resource: { type: 'interaction', id: interactionId },
        occurredAt: new Date(),
        metadata: { failureSource: 'structured_llm' },
      });

      return Result.failure(new InteractionAnalysisFailedError());
    }

    await this.recordAudit({
      actor,
      action: 'interaction_scan_passed',
      resource: { type: 'interaction', id: interactionId },
      occurredAt: new Date(),
    });

    const updatedInteraction: Interaction = { ...interaction, status: 'analysis_completed' };
    await interactionsRepo.save(updatedInteraction);
    await this.recordAudit({
      actor,
      action: 'interaction_analysis_completed',
      resource: { type: 'interaction', id: interactionId },
      occurredAt: new Date(),
    });
    return Result.success(updatedInteraction);
  }

  private async recordAudit(event: AuditEvent): Promise<void> {
    try {
      await this.dependencies.audit.record(event);
    } catch {
      // Best-effort for now. Later, state changes and audit writes should be transactional.
    }
  }
}
