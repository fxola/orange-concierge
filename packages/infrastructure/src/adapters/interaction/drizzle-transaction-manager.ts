import type {
  AuditEvent,
  Interaction,
  TransactionManager,
  TransactionalPorts,
} from '@orange-concierge/core';
import { auditEvents, interactions } from '../../database';
import type { OrangeConciergeDB } from '../../database';

export class DrizzleTransactionManager implements TransactionManager {
  constructor(private readonly db: OrangeConciergeDB) {}

  async execute<T>(commit: (tx: TransactionalPorts) => Promise<T>): Promise<T> {
    return this.db.transaction(async (dbTx) => {
      const tx: TransactionalPorts = {
        interactions: {
          save: async (interaction: Interaction): Promise<void> => {
            await dbTx
              .insert(interactions)
              .values({
                id: interaction.id,
                clientId: interaction.clientId,
                submittedBy: interaction.submittedBy,
                status: interaction.status,
                transcript: interaction.transcript,
                createdAt: interaction.createdAt,
              })
              .onConflictDoUpdate({
                target: interactions.id,
                set: {
                  clientId: interaction.clientId,
                  submittedBy: interaction.submittedBy,
                  status: interaction.status,
                  transcript: interaction.transcript,
                  createdAt: interaction.createdAt,
                },
              });
          },
        },
        audit: {
          record: async (event: AuditEvent): Promise<void> => {
            await dbTx.insert(auditEvents).values({
              actorId: event.actor.id,
              actorRole: event.actor.role,
              action: event.action,
              resourceType: event.resource.type,
              resourceId: event.resource.id,
              occurredAt: event.occurredAt,
              metadata: event.metadata ?? null,
            });
          },
        },
      };

      return commit(tx);
    });
  }
}
