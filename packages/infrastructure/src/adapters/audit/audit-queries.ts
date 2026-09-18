import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import type { AuditEvent, AuditEventFilter, AuditEventPage } from '@orange-concierge/core';

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

function toConditions(filter: AuditEventFilter): SQL[] {
  const conditions: SQL[] = [];

  if (filter.action !== undefined) {
    conditions.push(eq(auditEvents.action, filter.action));
  }

  if (filter.resourceType !== undefined) {
    conditions.push(eq(auditEvents.resourceType, filter.resourceType));
  }

  return conditions;
}

export async function listAuditEvents(
  db: AuditDatabase,
  filter: AuditEventFilter
): Promise<AuditEventPage> {
  const conditions = toConditions(filter);
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(auditEvents)
      .where(where)
      .orderBy(desc(auditEvents.occurredAt))
      .limit(filter.limit)
      .offset(filter.offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditEvents)
      .where(where),
  ]);

  return { events: rows.map(toAuditEvent), total: Number(count) };
}
