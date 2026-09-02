export type InteractionStatus = 'received' | 'analysis_blocked' | 'analysis_completed';

export type Interaction = Readonly<{
  id: string;
  clientId: string;
  submittedBy: string;
  status: InteractionStatus;
  transcript: string;
  createdAt: Date;
}>;
