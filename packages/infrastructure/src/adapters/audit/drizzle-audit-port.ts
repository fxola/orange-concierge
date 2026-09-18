import type { AuditEvent, AuditEventFilter, AuditPort } from '@orange-concierge/core';
import { auditEvents, type OrangeConciergeDB } from '../../database';
import { listAuditEvents } from './audit-queries';

export class DrizzleAuditPort implements AuditPort {
  constructor(private readonly db: OrangeConciergeDB) {}

  async record(event: AuditEvent): Promise<void> {
    await this.db.insert(auditEvents).values({
      actorId: event.actor.id,
      actorRole: event.actor.role,
      action: event.action,
      resourceType: event.resource.type,
      resourceId: event.resource.id,
      occurredAt: event.occurredAt,
      metadata: event.metadata ?? null,
    });
  }

  async list(filter: AuditEventFilter): Promise<readonly AuditEvent[]> {
    return listAuditEvents(this.db, filter);
  }
}
