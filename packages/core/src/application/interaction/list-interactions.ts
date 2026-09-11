import {
  ClientNotFoundError,
  InvalidClientIdError,
  InvalidPaginationError,
  UnauthorizedViewClientsError,
} from '../../errors';
import { parseClientId, parsePagination } from '../client/client-id';
import { Result } from '../result';
import { canViewInteractions } from './policy';
import type {
  ListInteractionsDependencies,
  ListInteractionsInput,
  ListInteractionsResult,
} from './types';

export class ListInteractions {
  constructor(private readonly dependencies: ListInteractionsDependencies) {}

  async execute(input: ListInteractionsInput): Promise<ListInteractionsResult> {
    const { actor, clientId, limit, offset } = input;

    if (!canViewInteractions(actor)) {
      return Result.failure(new UnauthorizedViewClientsError(actor.role));
    }

    const parsedClientId = parseClientId(clientId);
    if (!parsedClientId.ok) {
      return Result.failure(new InvalidClientIdError());
    }

    const parsedPagination = parsePagination({ limit, offset });
    if (!parsedPagination.ok) {
      return Result.failure(new InvalidPaginationError());
    }

    const { clientRepository, interactionsRepo } = this.dependencies;

    const clientExists = await clientRepository.exists(parsedClientId.clientId);
    if (!clientExists) {
      return Result.failure(new ClientNotFoundError(parsedClientId.clientId));
    }

    const interactions = await interactionsRepo.listByClient(
      parsedClientId.clientId,
      parsedPagination.limit,
      parsedPagination.offset
    );

    return Result.success(interactions);
  }
}
