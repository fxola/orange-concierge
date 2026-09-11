import { desc, eq } from 'drizzle-orm';
import type { Interaction, InteractionRepository } from '@orange-concierge/core';

import { interactions, type OrangeConciergeDB } from '../../database';

type InteractionRow = typeof interactions.$inferSelect;

function toDomain(row: InteractionRow): Interaction {
  return {
    id: row.id,
    clientId: row.clientId,
    submittedBy: row.submittedBy,
    status: row.status,
    transcript: row.transcript,
    createdAt: row.createdAt,
    ...(row.extractedFacts ? { extractedFacts: row.extractedFacts } : {}),
  };
}

export function toInteractionRow(interaction: Interaction): typeof interactions.$inferInsert {
  return {
    id: interaction.id,
    clientId: interaction.clientId,
    submittedBy: interaction.submittedBy,
    status: interaction.status,
    transcript: interaction.transcript,
    extractedFacts: interaction.extractedFacts ?? null,
    createdAt: interaction.createdAt,
  };
}

export class DrizzleInteractionRepository implements InteractionRepository {
  constructor(private readonly db: OrangeConciergeDB) {}

  async findById(id: string): Promise<Interaction | null> {
    const [row] = await this.db.select().from(interactions).where(eq(interactions.id, id)).limit(1);

    return row ? toDomain(row) : null;
  }

  async listByClient(
    clientId: string,
    limit: number,
    offset: number
  ): Promise<readonly Interaction[]> {
    const rows = await this.db
      .select()
      .from(interactions)
      .where(eq(interactions.clientId, clientId))
      .orderBy(desc(interactions.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map(toDomain);
  }

  async save(interaction: Interaction): Promise<void> {
    const row = toInteractionRow(interaction);

    await this.db.insert(interactions).values(row).onConflictDoUpdate({
      target: interactions.id,
      set: row,
    });
  }
}
