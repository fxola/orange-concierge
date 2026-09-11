import type { Interaction } from '../domain/interaction';

export interface InteractionRepository {
  findById(id: string): Promise<Interaction | null>;
  save(interaction: Interaction): Promise<void>;
  listByClient(clientId: string, limit: number, offset: number): Promise<readonly Interaction[]>;
}
