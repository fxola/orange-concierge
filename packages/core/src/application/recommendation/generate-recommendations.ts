import { calculateReadinessScore } from '../../domain/readiness-score';
import { Recommendation } from '../../domain/recommendation';
import {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  RecommendationDraftingFailedError,
} from '../../errors';
import { buildKnowledgeQuery } from '../knowledge/build-knowledge-query';
import { Result } from '../result';
import { groundRecommendations } from './ground-recommendations';
import {
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
    const knowledge = await this.deps.knowledgeRetriever.search({
      query: buildKnowledgeQuery(facts),
      limit: 3,
    });
    const draftResult = await this.deps.recommendationDrafter.draftRecommendations({
      interactionId: interaction.id,
      facts,
      readinessScore,
      clientEvidence,
      knowledge,
    });

    if (draftResult.isFailure()) {
      return Result.failure(new RecommendationDraftingFailedError(draftResult.getError()));
    }

    const grounded = groundRecommendations({
      drafts: draftResult.getValue(),
      clientEvidence,
      knowledge,
    });

    if (grounded.length === 0) {
      return Result.success({ recommendations: [] });
    }

    const now = this.deps.now();
    const recommendations = grounded.map((item) => ({
      id: this.deps.newRecommendationId(),
      ...item,
    }));

    await this.deps.transactionManager.execute(async (tx) => {
      for (const recommendation of recommendations) {
        await tx.recommendations.save({
          ...recommendation,
          clientId: interaction.clientId,
          interactionId: interaction.id,
          status: 'draft',
          rationale: recommendation.summary,
          createdAt: now,
        });
      }
    });

    return Result.success({ recommendations });
  }
}
