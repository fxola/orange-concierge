import type { AuditEvent, AuditPort } from '../../../src/ports/audit.js';
import type { AuditEventFilter, AuditEventPage } from '../../../src/domain/audit.js';

export class RecordingAudit implements AuditPort {
  events: AuditEvent[] = [];
  private shouldFail = false;
  private failNext = false;

  failRecording(): void {
    this.shouldFail = true;
  }

  failNextRecording(): void {
    this.failNext = true;
  }

  async record(event: AuditEvent): Promise<void> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error('Audit recording failed');
    }
    if (this.shouldFail) {
      throw new Error('Audit recording failed');
    }

    this.events.push(event);
  }

  async list(filter: AuditEventFilter): Promise<AuditEventPage> {
    const { action, resourceType, offset, limit } = filter;
    const matching = this.events
      .filter((event) => {
        const matchesAction = action === undefined || event.action === action;
        const matchesResourceType =
          resourceType === undefined || event.resource.type === filter.resourceType;

        return matchesAction && matchesResourceType;
      })
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    return { events: matching.slice(offset, offset + limit), total: matching.length };
  }

  snapshot(): AuditEvent[] {
    return [...this.events];
  }

  restore(snapshot: AuditEvent[]): void {
    this.events.length = 0;
    this.events.push(...snapshot);
  }
}
