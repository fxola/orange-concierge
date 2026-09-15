import type { OrangeConciergeAuth } from '../auth';
import type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  GetInteractionInput,
  GetInteractionResult,
  ListClientsInput,
  ListClientsResult,
  ListInteractionsInput,
  ListInteractionsResult,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
  SubmitInteractionInput,
  SubmitInteractionResult,
} from '@orange-concierge/core';

export type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  GetInteractionInput,
  GetInteractionResult,
  ListClientsInput,
  ListClientsResult,
  ListInteractionsInput,
  ListInteractionsResult,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
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
  };
}>;
