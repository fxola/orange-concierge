import { parseAuditEventFilter } from '../../domain/audit';
import { UnauthorizedViewAuditError } from '../../errors';
import { Result } from '../result';
import { canViewAuditTrail } from './policy';
import type {
  ListAuditEventsDependencies,
  ListAuditEventsInput,
  ListAuditEventsResult,
} from './types';

export class ListAuditEvents {
  constructor(private readonly deps: ListAuditEventsDependencies) {}

  async execute(input: ListAuditEventsInput): Promise<ListAuditEventsResult> {
    const { actor, action, resourceType, limit, offset } = input;
    if (!canViewAuditTrail(actor)) {
      return Result.failure(new UnauthorizedViewAuditError(actor.role));
    }

    const parsedFilter = parseAuditEventFilter({ action, resourceType, limit, offset });
    if (parsedFilter.isFailure()) {
      return Result.failure(parsedFilter.getError());
    }

    const page = await this.deps.audit.list(parsedFilter.getValue());

    return Result.success(page);
  }
}
