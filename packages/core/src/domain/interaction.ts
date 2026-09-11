import type { ExtractedFacts } from '../application/interaction/extracted-facts';

export type InteractionStatus = 'received' | 'analysis_blocked' | 'analysis_completed';

export type Interaction = Readonly<{
  id: string;
  clientId: string;
  submittedBy: string;
  status: InteractionStatus;
  transcript: string;
  createdAt: Date;
  extractedFacts?: ExtractedFacts;
}>;
