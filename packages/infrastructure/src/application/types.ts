import type { OrangeConciergeAuth } from '../auth';
import type {
  GetClientInput,
  GetClientResult,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  ListClientsInput,
  ListClientsResult,
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
};
export type { SubmitInteractionInput, SubmitInteractionResult };

export type Application = Readonly<{
  auth: OrangeConciergeAuth;
  interaction: {
    submit: (input: SubmitInteractionInput) => Promise<SubmitInteractionResult>;
    analyze: (input: AnalyzeInteractionInput) => Promise<AnalyzeInteractionResult>;
  };
  clients: {
    getAll: (input: ListClientsInput) => Promise<ListClientsResult>;
    getOne: (input: GetClientInput) => Promise<GetClientResult>;
  };
}>;
