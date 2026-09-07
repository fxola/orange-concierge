import type { Client } from '../domain/client';

export interface ClientRepository {
  getAll(limit: number, offset: number): Promise<readonly Client[]>;
  findById(id: string): Promise<Client | null>;
  exists(id: string): Promise<boolean>;
}
