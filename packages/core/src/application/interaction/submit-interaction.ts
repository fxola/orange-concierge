import type { Interaction } from '../../domain/interaction';
import {
  BlankTranscriptError,
  ClientNotFoundError,
  InteractionSubmissionFailedError,
  InvalidClientIdError,
  UnauthorizedSubmitInteractionError,
} from '../../errors';
import type { AuditEvent } from '../../ports/audit';
import { parseClientId } from '../client/client-id';
import { canSubmitInteractions } from './policy';
import { Result } from '../result';
import type {
  SubmitInteractionDependencies,
  SubmitInteractionInput,
  SubmitInteractionResult,
} from './types';

export class SubmitInteraction {
  constructor(private readonly deps: SubmitInteractionDependencies) {}

  async execute(input: SubmitInteractionInput): Promise<SubmitInteractionResult> {
    const { clientId, actor, transcript } = input;

    if (!canSubmitInteractions(actor)) {
      return Result.failure(new UnauthorizedSubmitInteractionError(actor.role));
    }

    if (transcript.trim().length === 0) {
      return Result.failure(new BlankTranscriptError());
    }

    const { submittedInteractionRecorder, clientRepository, newInteractionId, now } = this.deps;

    const parsedClientId = parseClientId(clientId);
    if (!parsedClientId.ok) {
      return Result.failure(new InvalidClientIdError());
    }

    const foundClient = await clientRepository.exists(parsedClientId.clientId);
    if (!foundClient) {
      return Result.failure(new ClientNotFoundError(parsedClientId.clientId));
    }

    const interaction: Interaction = {
      id: newInteractionId(),
      clientId: parsedClientId.clientId,
      submittedBy: actor.id,
      status: 'received',
      transcript,
      createdAt: now(),
    };

    const auditEvent: AuditEvent = {
      actor,
      action: 'interaction_submitted',
      resource: { type: 'interaction', id: interaction.id },
      occurredAt: interaction.createdAt,
      metadata: { clientId: interaction.clientId },
    };

    try {
      await submittedInteractionRecorder.record({ interaction, auditEvent });
    } catch (error) {
      return Result.failure(new InteractionSubmissionFailedError(error));
    }

    return Result.success(interaction);
  }
}
