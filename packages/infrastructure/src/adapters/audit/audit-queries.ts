import { and, desc, eq, type SQL } from 'drizzle-orm';
import type { AuditEvent, AuditEventFilter } from '@orange-concierge/core';

import { auditEvents, type OrangeConciergeDB } from '../../database';

type AuditEventRow = typeof auditEvents.$inferSelect;

type AuditDatabase = Pick<OrangeConciergeDB, 'select'>;

function toAuditEvent(row: AuditEventRow): AuditEvent {
  return {
    actor: { id: row.actorId, role: row.actorRole },
    action: row.action,
    resource: { type: row.resourceType, id: row.resourceId },
    occurredAt: row.occurredAt,
    ...(row.metadata ? { metadata: row.metadata } : {}),
  };
}

export async function listAuditEvents(
  db: AuditDatabase,
  filter: AuditEventFilter
): Promise<readonly AuditEvent[]> {
  const conditions: SQL[] = [];

  if (filter.action !== undefined) {
    conditions.push(eq(auditEvents.action, filter.action));
  }

  if (filter.resourceType !== undefined) {
    conditions.push(eq(auditEvents.resourceType, filter.resourceType));
  }

  const rows = await db
    .select()
    .from(auditEvents)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditEvents.occurredAt))
    .limit(filter.limit)
    .offset(filter.offset);

  return rows.map(toAuditEvent);
}
