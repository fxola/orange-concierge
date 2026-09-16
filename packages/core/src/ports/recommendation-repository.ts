import type { Recommendation } from '../domain/recommendation';

export interface RecommendationRepository {
  findById(id: string): Promise<Recommendation | null>;
  listByInteraction(interactionId: string): Promise<readonly Recommendation[]>;
  save(recommendation: Recommendation): Promise<void>;
}
