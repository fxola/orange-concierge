import type { OrangeConciergeAuth } from '../auth';
import type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  ListClientsInput,
  ListClientsResult,
  ListInteractionsInput,
  ListInteractionsResult,
  SubmitInteractionInput,
  SubmitInteractionResult,
} from '@orange-concierge/core';

export type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  ListClientsInput,
  ListClientsResult,
  ListInteractionsInput,
  ListInteractionsResult,
};
export type { SubmitInteractionInput, SubmitInteractionResult };

export type Application = Readonly<{
  auth: OrangeConciergeAuth;
  interaction: {
    submit: (input: SubmitInteractionInput) => Promise<SubmitInteractionResult>;
    analyze: (input: AnalyzeInteractionInput) => Promise<AnalyzeInteractionResult>;
    list: (input: ListInteractionsInput) => Promise<ListInteractionsResult>;
  };
  clients: {
    getAll: (input: ListClientsInput) => Promise<ListClientsResult>;
    getOne: (input: GetClientInput) => Promise<GetClientResult>;
  };
}>;
