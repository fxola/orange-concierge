import type { Actor } from '../../domain/actor';
import { AuditAction, AuditResourceType } from '../../domain/audit';
import type {
  InvalidAuditFilterError,
  InvalidPaginationError,
  UnauthorizedViewAuditError,
} from '../../errors';
import type { AuditEventPage } from '../../domain/audit';
import type { AuditPort } from '../../ports/audit';
import type { Result } from '../result';

export type ListAuditEventsInput = Readonly<{
  actor: Actor;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  limit: number;
  offset: number;
}>;

export type ListAuditEventsDependencies = Readonly<{
  audit: AuditPort;
}>;

export type ListAuditEventsError =
  | InvalidAuditFilterError
  | InvalidPaginationError
  | UnauthorizedViewAuditError;

export type ListAuditEventsResult = Result<AuditEventPage, ListAuditEventsError>;
