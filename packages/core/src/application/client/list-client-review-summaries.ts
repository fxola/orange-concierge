import { parseClientIds } from '../../domain/client';
import {
  ClientListLimitExceededError,
  InvalidClientIdError,
  UnauthorizedViewClientsError,
} from '../../errors';
import { Result } from '../result';
import { canViewClients } from './policy';
import type {
  ListClientReviewSummariesDependencies,
  ListClientReviewSummariesInput,
  ListClientReviewSummariesResult,
} from './types';

export class ListClientReviewSummaries {
  constructor(private readonly deps: ListClientReviewSummariesDependencies) {}

  async execute(input: ListClientReviewSummariesInput): Promise<ListClientReviewSummariesResult> {
    const { actor, clientIds } = input;

    if (!canViewClients(actor)) {
      return Result.failure(new UnauthorizedViewClientsError(actor.role));
    }

    const parsed = parseClientIds(clientIds);
    if ('reason' in parsed) {
      if (parsed.reason === 'invalid_client_id') {
        return Result.failure(new InvalidClientIdError());
      }
      if (parsed.reason === 'too_many_client_ids') {
        return Result.failure(new ClientListLimitExceededError(parsed.maximum));
      }
    }

    const normalizedClientIds = [...new Set(parsed.clientIds)];

    if (normalizedClientIds.length === 0) {
      return Result.success([]);
    }

    const { clientReviewSummaryRepository } = this.deps;
    const summaries = await clientReviewSummaryRepository.listForClients(normalizedClientIds);

    return Result.success(summaries);
  }
}
