import type { Client, ClientRepository } from '../../../src';

export class InMemoryClientRepository implements ClientRepository {
  clients: Client[] = [];

  findById(id: string): Promise<Client | null> {
    const client = this.clients.find((c) => c.id === id);
    if (!client) {
      return Promise.resolve(null);
    }
    return Promise.resolve(client);
  }

  getAll(limit: number, offset: number): Promise<readonly Client[]> {
    return Promise.resolve(this.clients.slice(offset, offset + limit));
  }

  exists(id: string): Promise<boolean> {
    return Promise.resolve(Boolean(this.clients.find((c) => c.id === id)));
  }
}
