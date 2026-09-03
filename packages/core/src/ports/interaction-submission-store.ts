import type { AuditEvent } from './audit';
import type { Interaction } from '../domain/interaction';

export interface InteractionSubmissionStore {
  saveSubmittedInteraction(input: {
    interaction: Interaction;
    auditEvent: AuditEvent;
  }): Promise<void>;
}
