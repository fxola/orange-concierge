import type { Interaction } from '../domain/interaction';

export interface InteractionRepository {
  findById(id: string): Promise<Interaction | null>;
}
