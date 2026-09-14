import { InvalidPaginationError, UnauthorizedViewClientsError } from '../../errors';
import { canViewClients } from './policy';
import { parsePagination } from './client-id';
import { Result } from '../result';
import type { ListClientsDependencies, ListClientsInput, ListClientsResult } from './types';

export class ListClients {
  constructor(private readonly deps: ListClientsDependencies) {}

  async execute(input: ListClientsInput): Promise<ListClientsResult> {
    const { actor, limit, offset } = input;

    if (!canViewClients(actor)) {
      return Result.failure(new UnauthorizedViewClientsError(actor.role));
    }

    const parsed = parsePagination({ limit, offset });
    if (!parsed.ok) {
      return Result.failure(new InvalidPaginationError());
    }

    const clients = await this.deps.clientRepository.getAll(parsed.limit, parsed.offset);

    return Result.success(clients);
  }
}
