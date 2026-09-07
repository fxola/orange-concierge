import {
  ClientNotFoundError,
  InvalidClientIdError,
  UnauthorizedViewClientsError,
} from '../../errors';
import { canViewClients } from './policy';
import { parseClientId } from './client-id';
import { Result } from '../result';
import type { GetClientDependencies, GetClientInput, GetClientResult } from './types';

export class GetClient {
  constructor(private readonly dependencies: GetClientDependencies) {}

  async execute(input: GetClientInput): Promise<GetClientResult> {
    const { actor, clientId } = input;

    if (!canViewClients(actor)) {
      return Result.failure(new UnauthorizedViewClientsError(actor.role));
    }

    const parsed = parseClientId(clientId);
    if (!parsed.ok) {
      return Result.failure(new InvalidClientIdError());
    }

    const client = await this.dependencies.clientRepository.findById(parsed.clientId);

    if (!client) {
      return Result.failure(new ClientNotFoundError(parsed.clientId));
    }

    return Result.success(client);
  }
}
