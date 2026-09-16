import type { Recommendation } from '../domain/recommendation';

export interface RecommendationRepository {
  findById(id: string): Promise<Recommendation | null>;
  save(recommendation: Recommendation): Promise<void>;
}
