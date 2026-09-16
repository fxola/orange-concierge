import type { Recommendation } from '../../../src/domain/recommendation';
import type { RecommendationRepository } from '../../../src/ports/recommendation-repository';

export class InMemoryRecommendationRepository implements RecommendationRepository {
  recommendations: Recommendation[] = [];
  private current: Recommendation | null;

  constructor(recommendation: Recommendation | null) {
    this.current = recommendation;
    if (recommendation) {
      this.recommendations.push(recommendation);
    }
  }

  async findById(id: string): Promise<Recommendation | null> {
    const found = this.recommendations.find((r) => r.id === id);
    if (found) return found;
    return this.current?.id === id ? this.current : null;
  }

  async listByInteraction(
    interactionId: string,
    options?: Readonly<{ includeSuperseded?: boolean }>
  ): Promise<readonly Recommendation[]> {
    return this.recommendations.filter(
      (r) =>
        r.interactionId === interactionId &&
        (options?.includeSuperseded || r.status !== 'superseded')
    );
  }

  async save(recommendation: Recommendation): Promise<void> {
    this.current = recommendation;
    const idx = this.recommendations.findIndex((r) => r.id === recommendation.id);
    if (idx >= 0) {
      this.recommendations[idx] = recommendation;
    } else {
      this.recommendations.push(recommendation);
    }
  }

  getCurrent(): Recommendation | null {
    return this.current;
  }

  snapshot(): { current: Recommendation | null; recommendations: Recommendation[] } {
    return { current: this.current, recommendations: [...this.recommendations] };
  }

  restore(snapshot: { current: Recommendation | null; recommendations: Recommendation[] }): void {
    this.current = snapshot.current;
    this.recommendations.length = 0;
    this.recommendations.push(...snapshot.recommendations);
  }
}
