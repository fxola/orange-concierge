import type { Client, ClientRepository } from '@orange-concierge/core';
import { clients } from '../../database';
import type { OrangeConciergeDB } from '../../database';
import { eq, sql } from 'drizzle-orm';

export class DrizzleClientRepository implements ClientRepository {
  constructor(private db: OrangeConciergeDB) {}

  async findById(id: string): Promise<Client | null> {
    const [result] = await this.db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return result ?? null;
  }

  async exists(id: string): Promise<boolean> {
    const [result] = await this.db
      .select({ exists: sql<boolean>`1` })
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    return Boolean(result);
  }

  async getAll(limit: number, offset: number): Promise<readonly Client[]> {
    return await this.db.query.clients.findMany({ limit, offset });
  }
}
