import z from 'zod';
import { InvalidAuditFilterError, InvalidPaginationError } from '../errors';
import { Result } from '../application/result';

const MAX_LIST_LIMIT = 100;

export const auditActions = [
  'interaction_submitted',
  'interaction_scan_passed',
  'interaction_scan_blocked',
  'interaction_analysis_completed',
  'interaction_analysis_failed',
  'recommendation_reviewed',
  'recommendation_edited',
] as const;

export type AuditAction = (typeof auditActions)[number];
export const auditResourceTypes = ['client', 'interaction', 'recommendation'] as const;
export type AuditResourceType = (typeof auditResourceTypes)[number];

export type AuditEventFilter = Readonly<{
  action?: AuditAction;
  resourceType?: AuditResourceType;
  limit: number;
  offset: number;
}>;

const auditEventFilterSchema = z
  .object({
    action: z.enum(auditActions).optional(),
    resourceType: z.enum(auditResourceTypes).optional(),
    limit: z.number().int().min(1).max(MAX_LIST_LIMIT),
    offset: z.number().int().min(0),
  })
  .strip();

export const parseAuditEventFilter = (
  raw: unknown
): Result<AuditEventFilter, InvalidAuditFilterError | InvalidPaginationError> => {
  const parsed = auditEventFilterSchema.safeParse(raw);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    if (issue.path[0] === 'limit' || issue.path[0] === 'offset') {
      return Result.failure(new InvalidPaginationError());
    }
    const path = issue.path.join('.') || 'filter';
    return Result.failure(new InvalidAuditFilterError(`${path}: ${issue.message}`));
  }
  return Result.success(parsed.data);
};
