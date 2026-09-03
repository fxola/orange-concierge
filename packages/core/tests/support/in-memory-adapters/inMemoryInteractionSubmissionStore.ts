import type { AuditEvent } from '../../../src/ports/audit.js';
import type { Interaction } from '../../../src/domain/interaction.js';
import type { InteractionSubmissionStore } from '../../../src/ports/interaction-submission-store.js';

export class InMemoryInteractionSubmissionStore implements InteractionSubmissionStore {
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

  async saveSubmittedInteraction(input: {
    interaction: Interaction;
    auditEvent: AuditEvent;
  }): Promise<void> {
    if (this.shouldFail) {
      this.shouldFail = false;
      throw new Error('InteractionSubmissionStore save failed');
    }

    // Atomic in-memory: only mutate after all preconditions succeed.
    // Real Postgres adapter will use a DB transaction.
    this.interactions.push(input.interaction);
    this.events.push(input.auditEvent);
  }
}
