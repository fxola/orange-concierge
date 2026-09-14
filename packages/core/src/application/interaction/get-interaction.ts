import {
  InteractionNotFoundError,
  InvalidClientIdError,
  UnauthorizedViewClientsError,
} from '../../errors';
import { parseClientId } from '../client/client-id';
import { Result } from '../result';
import { canViewInteractions } from './policy';
import type {
  GetInteractionDependencies,
  GetInteractionInput,
  GetInteractionResult,
} from './types';

export class GetInteraction {
  constructor(private readonly deps: GetInteractionDependencies) {}

  async execute(input: GetInteractionInput): Promise<GetInteractionResult> {
    const { actor, clientId, interactionId } = input;

    if (!canViewInteractions(actor)) {
      return Result.failure(new UnauthorizedViewClientsError(actor.role));
    }

    const parsedClientId = parseClientId(clientId);
    if (!parsedClientId.ok) {
      return Result.failure(new InvalidClientIdError());
    }

    const interaction = await this.deps.interactionsRepo.findById(interactionId);
    if (!interaction || interaction.clientId !== parsedClientId.clientId) {
      return Result.failure(new InteractionNotFoundError(interactionId));
    }

    return Result.success(interaction);
  }
}
