import type {
  AuditEvent,
  AuditEventFilter,
  AuditEventPage,
  Interaction,
  InteractionTransactionManager,
  InteractionTransactionalPorts,
} from '@orange-concierge/core';
import { auditEvents, interactions } from '../../database';
import type { OrangeConciergeDB } from '../../database';
import { listAuditEvents } from '../audit/audit-queries';
import { toInteractionRow } from './drizzle-interaction-repository';

export class DrizzleTransactionManager implements InteractionTransactionManager {
  constructor(private readonly db: OrangeConciergeDB) {}

  async execute<T>(commit: (tx: InteractionTransactionalPorts) => Promise<T>): Promise<T> {
    return this.db.transaction(async (dbTx) => {
      const tx: InteractionTransactionalPorts = {
        interactions: {
          save: async (interaction: Interaction): Promise<void> => {
            const row = toInteractionRow(interaction);

            await dbTx.insert(interactions).values(row).onConflictDoUpdate({
              target: interactions.id,
              set: row,
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
          list: async (filter: AuditEventFilter): Promise<AuditEventPage> => {
            return listAuditEvents(dbTx, filter);
          },
        },
      };

      return commit(tx);
    });
  }
}
