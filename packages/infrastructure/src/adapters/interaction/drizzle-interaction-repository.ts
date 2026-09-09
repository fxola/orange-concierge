import { eq } from 'drizzle-orm';
import type { Interaction, InteractionRepository } from '@orange-concierge/core';

import { interactions, type OrangeConciergeDB } from '../../database';

export class DrizzleInteractionRepository implements InteractionRepository {
  constructor(private readonly db: OrangeConciergeDB) {}

  async findById(id: string): Promise<Interaction | null> {
    const [row] = await this.db.select().from(interactions).where(eq(interactions.id, id)).limit(1);

    return row ?? null;
  }

  async save(interaction: Interaction): Promise<void> {
    await this.db
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
  }
}
