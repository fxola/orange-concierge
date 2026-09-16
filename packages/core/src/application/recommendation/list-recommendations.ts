import { Result } from '../result';
import type {
  ListRecommendationsDependencies,
  ListRecommendationsInput,
  ListRecommendationsResult,
} from './types';

export class ListRecommendations {
  constructor(private readonly deps: ListRecommendationsDependencies) {}

  async execute(input: ListRecommendationsInput): Promise<ListRecommendationsResult> {
    const recommendations = await this.deps.recommendationRepository.listByInteraction(
      input.interactionId,
      { includeSuperseded: input.includeSuperseded }
    );
    return Result.success(recommendations);
  }
}
