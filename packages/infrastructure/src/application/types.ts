import type { OrangeConciergeAuth } from '../auth';
import type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  EditRecommendationDraftInput,
  EditRecommendationDraftResult,
  GetInteractionInput,
  GetInteractionResult,
  ListClientsInput,
  ListClientsResult,
  ListInteractionsInput,
  ListInteractionsResult,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
  ListRecommendationsInput,
  ListRecommendationsResult,
  ReviewRecommendationInput,
  ReviewRecommendationResult,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
  SubmitRecommendationForReviewInput,
  SubmitRecommendationForReviewResult,
  SubmitInteractionInput,
  SubmitInteractionResult,
  ListAuditEventsInput,
  ListAuditEventsResult,
} from '@orange-concierge/core';

export type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  EditRecommendationDraftInput,
  EditRecommendationDraftResult,
  GetInteractionInput,
  GetInteractionResult,
  ListClientsInput,
  ListClientsResult,
  ListInteractionsInput,
  ListInteractionsResult,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
  ListRecommendationsInput,
  ListRecommendationsResult,
  ReviewRecommendationInput,
  ReviewRecommendationResult,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
  SubmitRecommendationForReviewInput,
  SubmitRecommendationForReviewResult,
};
export type { SubmitInteractionInput, SubmitInteractionResult };

export type Application = Readonly<{
  auth: OrangeConciergeAuth;
  interaction: {
    submit: (input: SubmitInteractionInput) => Promise<SubmitInteractionResult>;
    analyze: (input: AnalyzeInteractionInput) => Promise<AnalyzeInteractionResult>;
    getOne: (input: GetInteractionInput) => Promise<GetInteractionResult>;
    list: (input: ListInteractionsInput) => Promise<ListInteractionsResult>;
  };
  clients: {
    getAll: (input: ListClientsInput) => Promise<ListClientsResult>;
    getOne: (input: GetClientInput) => Promise<GetClientResult>;
  };
  knowledge: {
    search: (input: SearchKnowledgeInput) => Promise<SearchKnowledgeResult>;
  };
  recommendations: {
    generate: (input: GenerateRecommendationsInput) => Promise<GenerateRecommendationsResult>;
    list: (input: ListRecommendationsInput) => Promise<ListRecommendationsResult>;
    submitForReview: (
      input: SubmitRecommendationForReviewInput
    ) => Promise<SubmitRecommendationForReviewResult>;
    review: (input: ReviewRecommendationInput) => Promise<ReviewRecommendationResult>;
    editDraft: (input: EditRecommendationDraftInput) => Promise<EditRecommendationDraftResult>;
  };
  audit: {
    list: (input: ListAuditEventsInput) => Promise<ListAuditEventsResult>;
  };
}>;
