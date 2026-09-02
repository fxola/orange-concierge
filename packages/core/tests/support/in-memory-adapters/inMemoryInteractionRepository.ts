import type { Interaction } from '../../../src/domain/interaction.js';
import type { InteractionRepository } from '../../../src/ports/interaction-repository.js';

export class InMemoryInteractionRepository implements InteractionRepository {
  findByIdCalls = 0;
  interactions: Interaction[] = [];
  private current: Interaction | null;

  constructor(interaction: Interaction | null) {
    this.current = interaction;
  }

  async findById(id: string): Promise<Interaction | null> {
    this.findByIdCalls += 1;
    return this.current?.id === id ? this.current : null;
  }

  async save(interaction: Interaction): Promise<void> {
    this.current = interaction;
    this.interactions.push(interaction);
  }

  getCurrent(): Interaction | null {
    return this.current;
  }
}
