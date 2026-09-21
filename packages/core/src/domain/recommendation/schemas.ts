import { z } from 'zod';
import { recommendationPriorities } from '.';

const recommendationCitationSchema = z.string().trim().min(1);

export const recommendationModelDraftSchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    summary: z.string().trim().min(1).max(180),
    priority: z.enum(recommendationPriorities),
    clientEvidence: z.array(recommendationCitationSchema).min(1),
    knowledgeSources: z.array(recommendationCitationSchema).min(1),
  })
  .strict();

export const recommendationModelOutputSchema = z
  .object({
    recommendations: z.array(recommendationModelDraftSchema).max(3),
  })
  .strict();

export const recommendationModelOutputJsonSchema = z.toJSONSchema(recommendationModelOutputSchema, {
  target: 'draft-7',
}) as Record<string, unknown>;

export type RecommendationModelOutput = z.infer<typeof recommendationModelOutputSchema>;
