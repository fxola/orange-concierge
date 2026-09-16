import z from 'zod';
import type { EvidenceReference } from '../application/interaction/extracted-facts';
import type { KnowledgeSearchHit } from '../ports/knowledge-retriever';
import type { RecommendationPriority } from '../ports/recommendation-drafter';

export type RecommendationStatus =
  | 'draft'
  | 'superseded'
  | 'pending_review'
  | 'approved'
  | 'rejected';

export type Recommendation = Readonly<{
  id: string;
  clientId: string;
  interactionId: string;
  status: RecommendationStatus;
  title: string;
  rationale: string;
  summary: string;
  priority: RecommendationPriority;
  clientEvidence?: readonly EvidenceReference[];
  knowledgeCitations?: readonly KnowledgeSearchHit[];
  createdAt: Date;
  supersededAt?: Date;
  reviewerId?: string;
  reviewedAt?: Date;
}>;

export const recommendationIdSchema = z.string().trim().pipe(z.uuid());

export const parseRecommendationId = (
  raw: unknown
): { ok: true; recommendationId: string } | { ok: false } => {
  const result = recommendationIdSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false };
  }
  return { ok: true, recommendationId: result.data };
};
