export type ClientReviewSummary = Readonly<{
  clientId: string;
  totalInteractions: number;
  needsAnalysis: number;
  completed: number;
  blocked: number;
  latestInteractionAt?: Date;
}>;

export interface ClientReviewSummaryRepository {
  listForClients(clientIds: readonly string[]): Promise<readonly ClientReviewSummary[]>;
}
