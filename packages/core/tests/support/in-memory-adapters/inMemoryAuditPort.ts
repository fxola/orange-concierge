import type { AuditEvent, AuditPort } from '../../../src/ports/audit.js';

export class RecordingAudit implements AuditPort {
  events: AuditEvent[] = [];
  private shouldFail = false;

  failRecording(): void {
    this.shouldFail = true;
  }

  async record(event: AuditEvent): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Audit recording failed');
    }

    this.events.push(event);
  }
}
