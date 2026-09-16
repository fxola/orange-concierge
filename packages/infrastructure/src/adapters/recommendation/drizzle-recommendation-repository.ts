import { eq } from 'drizzle-orm';
import type { Recommendation, RecommendationRepository } from '@orange-concierge/core';

import { recommendations, type OrangeConciergeDB } from '../../database';

type RecommendationRow = typeof recommendations.$inferSelect;

function toDomain(row: RecommendationRow): Recommendation {
  return {
    id: row.id,
    clientId: row.clientId,
    interactionId: row.interactionId,
    status: row.status,
    title: row.title,
    rationale: row.rationale,
    summary: row.summary ?? '',
    priority: row.priority ?? 'medium',
    clientEvidence: row.clientEvidence ?? undefined,
    knowledgeCitations: row.knowledgeCitations ?? undefined,
    createdAt: row.createdAt,
    supersededAt: row.supersededAt ?? undefined,
    reviewerId: row.reviewerId ?? undefined,
    reviewedAt: row.reviewedAt ?? undefined,
  };
}

function toRow(recommendation: Recommendation): typeof recommendations.$inferInsert {
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
    supersededAt: recommendation.supersededAt ?? null,
    reviewerId: recommendation.reviewerId ?? null,
    reviewedAt: recommendation.reviewedAt ?? null,
  };
}

export class DrizzleRecommendationRepository implements RecommendationRepository {
  constructor(private readonly db: OrangeConciergeDB) {}

  async findById(id: string): Promise<Recommendation | null> {
    const [row] = await this.db.select().from(recommendations).where(eq(recommendations.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async listByInteraction(interactionId: string): Promise<readonly Recommendation[]> {
    const rows = await this.db
      .select()
      .from(recommendations)
      .where(eq(recommendations.interactionId, interactionId));
    return rows.map(toDomain);
  }

  async save(recommendation: Recommendation): Promise<void> {
    const row = toRow(recommendation);
    await this.db.insert(recommendations).values(row).onConflictDoUpdate({
      target: recommendations.id,
      set: row,
    });
  }
}
