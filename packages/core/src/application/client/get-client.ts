import {
  ClientNotFoundError,
  InvalidClientIdError,
  UnauthorizedViewClientsError,
} from '../../errors';
import { canViewClients } from './policy';
import { Result } from '../result';
import type { GetClientDependencies, GetClientInput, GetClientResult } from './types';
import { parseClientId } from '../../domain/client';

export class GetClient {
  constructor(private readonly deps: GetClientDependencies) {}

  async execute(input: GetClientInput): Promise<GetClientResult> {
    const { actor, clientId } = input;

    if (!canViewClients(actor)) {
      return Result.failure(new UnauthorizedViewClientsError(actor.role));
    }

    const parsed = parseClientId(clientId);
    if (!parsed.ok) {
      return Result.failure(new InvalidClientIdError());
    }

    const client = await this.deps.clientRepository.findById(parsed.clientId);

    if (!client) {
      return Result.failure(new ClientNotFoundError(parsed.clientId));
    }

    return Result.success(client);
  }
}
