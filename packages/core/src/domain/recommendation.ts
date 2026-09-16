export type RecommendationStatus =
  | 'draft'
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
  createdAt: Date;
  reviewerId?: string;
  reviewedAt?: Date;
}>;
