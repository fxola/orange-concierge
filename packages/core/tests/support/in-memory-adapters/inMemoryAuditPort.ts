import type { AuditEvent, AuditPort } from '../../../src/ports/audit.js';

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

  snapshot(): AuditEvent[] {
    return [...this.events];
  }

  restore(snapshot: AuditEvent[]): void {
    this.events.length = 0;
    this.events.push(...snapshot);
  }
}
