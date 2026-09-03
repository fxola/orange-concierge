import type { AuditEvent } from '../../../src/ports/audit.js';
import type { Interaction } from '../../../src/domain/interaction.js';
import type { SubmittedInteractionRecorder } from '../../../src/ports/submitted-interaction-recorder.js';

export class InMemorySubmittedInteractionRecorder implements SubmittedInteractionRecorder {
  interactions: Interaction[] = [];
  events: AuditEvent[] = [];
  private shouldFail = false;

  failNextSave(): void {
    this.shouldFail = true;
  }

  failNextAudit(): void {
    this.shouldFail = true;
  }

  failNext(): void {
    this.shouldFail = true;
  }

  async record(input: {
    interaction: Interaction;
    auditEvent: AuditEvent;
  }): Promise<void> {
    if (this.shouldFail) {
      this.shouldFail = false;
      throw new Error('SubmittedInteractionRecorder record failed');
    }

    // Atomic in-memory: only mutate after all preconditions succeed.
    // Real Postgres adapter will use a DB transaction.
    this.interactions.push(input.interaction);
    this.events.push(input.auditEvent);
  }
}
