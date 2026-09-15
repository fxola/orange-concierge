import { calculateReadinessScore } from '../../domain/readiness-score';
import { InteractionAnalysisFailedError, InteractionNotFoundError } from '../../errors';
import { buildKnowledgeQuery } from '../knowledge/build-knowledge-query';
import { Result } from '../result';
import { groundRecommendations } from './ground-recommendations';
import type {
  GenerateRecommendationsDependencies,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
} from './types';

export class GenerateRecommendations {
  constructor(private readonly deps: GenerateRecommendationsDependencies) {}

  async execute(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsResult> {
    const interaction = await this.deps.interactionsRepo.findById(input.interactionId);
    if (!interaction) {
      return Result.failure(new InteractionNotFoundError(input.interactionId));
    }

    if (interaction.status !== 'analysis_completed' || !interaction.extractedFacts) {
      return Result.failure(new InteractionAnalysisFailedError());
    }

    const facts = interaction.extractedFacts;
    const clientEvidence = facts.evidence ?? [];
    const readinessScore = calculateReadinessScore(facts);
    const knowledge = await this.deps.KnowledgeRetriever.search({
      query: buildKnowledgeQuery(facts),
      limit: 5,
    });
    const draftResult = await this.deps.recommendationDrafter.draftRecommendations({
      interactionId: interaction.id,
      facts,
      readinessScore,
      clientEvidence,
      knowledge,
    });

    if (draftResult.isFailure()) {
      return Result.failure(new InteractionAnalysisFailedError());
    }

    const recommendations = groundRecommendations({
      drafts: draftResult.getValue(),
      clientEvidence,
      knowledge,
    });

    return Result.success({ recommendations });
  }
}
