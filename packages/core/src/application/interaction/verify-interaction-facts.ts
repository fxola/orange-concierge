import { parseInteractionId, type Interaction } from '../../domain/interaction';
import {
  FactVerificationFailedError,
  InteractionNotFoundError,
  InvalidFactPathError,
  InvalidInteractionIdError,
  InvalidInteractionStateError,
  UnauthorizedVerifyFactsError,
} from '../../errors';
import type { AuditEvent } from '../../ports/audit';
import { factPathsFor } from '../../domain/client-assessment-facts';
import { canVerifyInteractionFacts } from './policy';
import { Result } from '../result';
import type {
  VerifyInteractionFactsDependencies,
  VerifyInteractionFactsInput,
  VerifyInteractionFactsResult,
} from './types';

const MAX_VERIFIED_PATHS = 30;

export class VerifyInteractionFacts {
  constructor(private readonly deps: VerifyInteractionFactsDependencies) {}

  async execute(input: VerifyInteractionFactsInput): Promise<VerifyInteractionFactsResult> {
    const { actor, interactionId, factPaths } = input;

    if (!canVerifyInteractionFacts(actor)) {
      return Result.failure(new UnauthorizedVerifyFactsError(actor.role));
    }

    const parsedInteractionId = parseInteractionId(interactionId);
    if (!parsedInteractionId.ok) {
      return Result.failure(new InvalidInteractionIdError());
    }

    const interaction = await this.deps.interactionsRepo.findById(
      parsedInteractionId.interactionId
    );
    if (!interaction) {
      return Result.failure(new InteractionNotFoundError(parsedInteractionId.interactionId));
    }

    if (interaction.status !== 'analysis_completed' || !interaction.extractedFacts) {
      return Result.failure(new InvalidInteractionStateError(interaction.status));
    }

    const validPaths = new Set(factPathsFor(interaction.extractedFacts));
    const normalized = [...new Set(factPaths.map((path) => path.trim()).filter((path) => path.length > 0))].sort();

    if (normalized.length > MAX_VERIFIED_PATHS) {
      return Result.failure(
        new InvalidFactPathError(`at most ${MAX_VERIFIED_PATHS} fact paths can be verified`)
      );
    }

    for (const path of normalized) {
      if (!validPaths.has(path)) {
        return Result.failure(new InvalidFactPathError(`unknown fact path: ${path}`));
      }
    }

    const updatedInteraction: Interaction = { ...interaction, verifiedFactPaths: normalized };
    const verifiedAuditEvent: AuditEvent = {
      actor,
      action: 'interaction_facts_verified',
      resource: { type: 'interaction', id: parsedInteractionId.interactionId },
      occurredAt: this.deps.now(),
      metadata: { factPathCount: normalized.length },
    };

    try {
      await this.deps.transactionManager.execute(async (tx) => {
        await tx.interactions.save(updatedInteraction);
        await tx.audit.record(verifiedAuditEvent);
      });
    } catch {
      return Result.failure(new FactVerificationFailedError());
    }

    return Result.success({ interaction: updatedInteraction });
  }
}
