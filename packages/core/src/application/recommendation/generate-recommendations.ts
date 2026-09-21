import { parseInteractionId } from '../../domain/interaction';
import { calculateEvidenceCoverage } from '../../domain/client-assessment-facts';
import { calculateReadinessScore } from '../../domain/readiness-score';
import { groundRecommendations } from '../../domain/recommendation/grounding';
import {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidInteractionIdError,
  RecommendationDraftingFailedError,
} from '../../errors';
import { buildKnowledgeQuery } from '../knowledge/build-knowledge-query';
import { Result } from '../result';
import {
  GenerateRecommendationsDependencies,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
} from './types';

export class GenerateRecommendations {
  constructor(private readonly deps: GenerateRecommendationsDependencies) {}

  async execute(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsResult> {
    const parsedInteractionId = parseInteractionId(input.interactionId);
    if (!parsedInteractionId.ok) {
      return Result.failure(new InvalidInteractionIdError());
    }

    const interaction = await this.deps.interactionsRepo.findById(
      parsedInteractionId.interactionId
    );

    if (!interaction) {
      return Result.failure(new InteractionNotFoundError(parsedInteractionId.interactionId));
    }

    if (interaction.status !== 'analysis_completed' || !interaction.extractedFacts) {
      return Result.failure(new InteractionAnalysisFailedError());
    }

    const facts = interaction.extractedFacts;
    const coverage = calculateEvidenceCoverage(facts, interaction.verifiedFactPaths ?? []);
    if (coverage.total === 0 || coverage.isLowConfidence) {
      return Result.success({ recommendations: [] });
    }

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
      await tx.recommendations.supersedeDraftsByInteractionId(interaction.id, now);

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
