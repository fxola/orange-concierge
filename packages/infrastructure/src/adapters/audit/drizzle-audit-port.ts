import type { AuditEvent, AuditPort } from '@orange-concierge/core';
import { auditEvents, type OrangeConciergeDB } from '../../database';

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
}
