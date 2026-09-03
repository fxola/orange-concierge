import type { AuditEvent } from './audit';
import type { Interaction } from '../domain/interaction';

export interface SubmittedInteractionRecorder {
  record(input: {
    interaction: Interaction;
    auditEvent: AuditEvent;
  }): Promise<void>;
}
