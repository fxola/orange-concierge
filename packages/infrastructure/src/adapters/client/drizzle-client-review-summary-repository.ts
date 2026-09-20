import type { ClientReviewSummary, ClientReviewSummaryRepository } from '@orange-concierge/core';
import { inArray, sql } from 'drizzle-orm';
import { interactions } from '../../database';
import type { OrangeConciergeDB } from '../../database';

type SummaryRow = Readonly<{
  clientId: string;
  totalInteractions: number;
  needsAnalysis: number;
  completed: number;
  blocked: number;
  latestInteractionAt: Date | string | null;
}>;

function toDate(value: Date | string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value : new Date(value);
}

export class DrizzleClientReviewSummaryRepository implements ClientReviewSummaryRepository {
  constructor(private readonly db: OrangeConciergeDB) {}

  async listForClients(clientIds: readonly string[]): Promise<readonly ClientReviewSummary[]> {
    const uniqueClientIds = [...new Set(clientIds)];
    if (uniqueClientIds.length === 0) {
      return [];
    }

    const rows: SummaryRow[] = await this.db
      .select({
        clientId: interactions.clientId,
        totalInteractions: sql<number>`count(*)::int`,
        needsAnalysis: sql<number>`sum(case when ${interactions.status} = 'received' then 1 else 0 end)::int`,
        completed: sql<number>`sum(case when ${interactions.status} = 'analysis_completed' then 1 else 0 end)::int`,
        blocked: sql<number>`sum(case when ${interactions.status} = 'analysis_blocked' then 1 else 0 end)::int`,
        latestInteractionAt: sql<Date | string | null>`max(${interactions.createdAt})`,
      })
      .from(interactions)
      .where(inArray(interactions.clientId, uniqueClientIds))
      .groupBy(interactions.clientId);

    const rowByClientId = new Map(rows.map((row) => [row.clientId, row]));

    return uniqueClientIds.map((clientId) => {
      const row = rowByClientId.get(clientId);
      const latestInteractionAt = row ? toDate(row.latestInteractionAt) : undefined;

      return {
        clientId,
        totalInteractions: row?.totalInteractions ?? 0,
        needsAnalysis: row?.needsAnalysis ?? 0,
        completed: row?.completed ?? 0,
        blocked: row?.blocked ?? 0,
        ...(latestInteractionAt ? { latestInteractionAt } : {}),
      };
    });
  }
}
