import z from 'zod';
import { Result } from '../../application/result';
import { InvalidRecommendationEditError } from '../../errors';
import { recommendationPriorities, type Recommendation } from '.';

const editDraftPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(80).optional(),
    summary: z.string().trim().min(1).max(180).optional(),
    priority: z.enum(recommendationPriorities).optional(),
  })
  .strip();

export type RecommendationEditField = 'title' | 'summary' | 'priority';

export type RecommendationEdit = Readonly<{
  recommendation: Recommendation;
  changedFields: readonly RecommendationEditField[];
}>;

export function editRecommendationDraft(
  current: Recommendation,
  rawPatch: unknown
): Result<RecommendationEdit, InvalidRecommendationEditError> {
  const parsed = editDraftPatchSchema.safeParse(rawPatch);
  if (!parsed.success) {
    const [issue] = parsed.error.issues;
    const path = issue.path.join('.') || 'patch';
    return Result.failure(new InvalidRecommendationEditError(`${path}: ${issue.message}`));
  }

  if (Object.keys(parsed.data).length === 0) {
    return Result.failure(new InvalidRecommendationEditError('patch changes no fields'));
  }

  const changedFields: RecommendationEditField[] = [];
  if (parsed.data.title !== undefined && parsed.data.title !== current.title) {
    changedFields.push('title');
  }
  if (parsed.data.summary !== undefined && parsed.data.summary !== current.summary) {
    changedFields.push('summary');
  }
  if (parsed.data.priority !== undefined && parsed.data.priority !== current.priority) {
    changedFields.push('priority');
  }
  if (changedFields.length === 0) {
    return Result.failure(new InvalidRecommendationEditError('patch changes no fields'));
  }

  return Result.success({
    recommendation: {
      ...current,
      title: parsed.data.title ?? current.title,
      summary: parsed.data.summary ?? current.summary,
      priority: parsed.data.priority ?? current.priority,
    },
    changedFields,
  });
}
