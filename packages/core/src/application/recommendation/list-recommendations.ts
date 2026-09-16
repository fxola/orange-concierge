import { parseInteractionId } from '../../domain/interaction';
import { InteractionNotFoundError, InvalidInteractionIdError } from '../../errors';
import { Result } from '../result';
import type {
  ListRecommendationsDependencies,
  ListRecommendationsInput,
  ListRecommendationsResult,
} from './types';

export class ListRecommendations {
  constructor(private readonly deps: ListRecommendationsDependencies) {}

  async execute(input: ListRecommendationsInput): Promise<ListRecommendationsResult> {
    const parsedInteractionId = parseInteractionId(input.interactionId);
    if (!parsedInteractionId.ok) {
      return Result.failure(new InvalidInteractionIdError());
    }

    const interaction = await this.deps.interactionRepository.findById(
      parsedInteractionId.interactionId
    );

    if (!interaction) {
      return Result.failure(new InteractionNotFoundError(parsedInteractionId.interactionId));
    }

    const recommendations = await this.deps.recommendationRepository.listByInteraction(
      parsedInteractionId.interactionId,
      { includeSuperseded: input.includeSuperseded }
    );
    return Result.success(recommendations);
  }
}
