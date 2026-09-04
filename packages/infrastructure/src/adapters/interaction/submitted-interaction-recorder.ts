import type { AuditEvent, Interaction, SubmittedInteractionRecorder } from '@orange-concierge/core';
import { auditEvents, interactions, type OrangeConciergeDB } from '../../database';

export class DrizzleSubmittedInteractionRecorder implements SubmittedInteractionRecorder {
  constructor(private readonly db: OrangeConciergeDB) {}

  async record(input: { interaction: Interaction; auditEvent: AuditEvent }): Promise<void> {
    const { interaction, auditEvent } = input;

    await this.db.transaction(async (tx) => {
      await tx.insert(interactions).values({
        id: interaction.id,
        clientId: interaction.clientId,
        submittedBy: interaction.submittedBy,
        status: interaction.status,
        transcript: interaction.transcript,
        createdAt: interaction.createdAt,
      });

      await tx.insert(auditEvents).values({
        actorId: auditEvent.actor.id,
        actorRole: auditEvent.actor.role,
        action: auditEvent.action,
        resourceType: auditEvent.resource.type,
        resourceId: auditEvent.resource.id,
        occurredAt: auditEvent.occurredAt,
        metadata: auditEvent.metadata ?? null,
      });
    });
  }
}
