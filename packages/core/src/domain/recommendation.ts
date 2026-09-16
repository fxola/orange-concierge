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
