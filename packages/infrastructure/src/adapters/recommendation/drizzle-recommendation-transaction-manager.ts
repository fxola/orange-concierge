import type {
  AuditEvent,
  Recommendation,
  RecommendationTransactionalPorts,
  RecommendationTransactionManager,
} from '@orange-concierge/core';
import { auditEvents, recommendations } from '../../database';
import type { OrangeConciergeDB } from '../../database';

function toRecommendationRow(recommendation: Recommendation): typeof recommendations.$inferInsert {
  return {
    id: recommendation.id,
    clientId: recommendation.clientId,
    interactionId: recommendation.interactionId,
    status: recommendation.status,
    title: recommendation.title,
    rationale: recommendation.rationale,
    summary: recommendation.summary ?? null,
    priority: recommendation.priority ?? null,
    clientEvidence: recommendation.clientEvidence ? [...recommendation.clientEvidence] : null,
    knowledgeCitations: recommendation.knowledgeCitations ? [...recommendation.knowledgeCitations] : null,
    createdAt: recommendation.createdAt,
    reviewerId: recommendation.reviewerId ?? null,
    reviewedAt: recommendation.reviewedAt ?? null,
  };
}

export class DrizzleRecommendationTransactionManager implements RecommendationTransactionManager {
  constructor(private readonly db: OrangeConciergeDB) {}

  async execute<T>(commit: (tx: RecommendationTransactionalPorts) => Promise<T>): Promise<T> {
    return this.db.transaction(async (dbTx) => {
      const tx: RecommendationTransactionalPorts = {
        recommendations: {
          save: async (recommendation: Recommendation): Promise<void> => {
            const row = toRecommendationRow(recommendation);
            await dbTx.insert(recommendations).values(row).onConflictDoUpdate({
              target: recommendations.id,
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
        },
      };

      return commit(tx);
    });
  }
}
