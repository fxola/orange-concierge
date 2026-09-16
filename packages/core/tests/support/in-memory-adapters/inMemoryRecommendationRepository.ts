import type { Recommendation } from '../../../src/domain/recommendation';
import type { RecommendationRepository } from '../../../src/ports/recommendation-repository';

export class InMemoryRecommendationRepository implements RecommendationRepository {
  recommendations: Recommendation[] = [];
  private current: Recommendation | null;

  constructor(recommendation: Recommendation | null) {
    this.current = recommendation;
  }

  async findById(id: string): Promise<Recommendation | null> {
    return this.current?.id === id ? this.current : null;
  }

  async save(recommendation: Recommendation): Promise<void> {
    this.current = recommendation;
    this.recommendations.push(recommendation);
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
