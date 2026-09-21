import type { RecommendationDraft } from './grounding';
import { recommendationModelOutputSchema } from './schemas';

export type ParseRecommendationModelOutputResult =
  | Readonly<{ ok: true; drafts: readonly RecommendationDraft[] }>
  | Readonly<{ ok: false }>;

export function parseRecommendationModelOutput(raw: unknown): ParseRecommendationModelOutputResult {
  const result = recommendationModelOutputSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false };
  }

  return {
    ok: true,
    drafts: result.data.recommendations.map((recommendation) => ({
      title: recommendation.title,
      summary: recommendation.summary,
      priority: recommendation.priority,
      clientEvidence: recommendation.clientEvidence,
      knowledgeSources: recommendation.knowledgeSources,
    })),
  };
}
