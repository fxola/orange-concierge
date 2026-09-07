import type { OrangeConciergeAuth } from '../auth';
import type {
  GetClientInput,
  GetClientResult,
  ListClientsInput,
  ListClientsResult,
  SubmitInteractionInput,
  SubmitInteractionResult,
} from '@orange-concierge/core';

export type { GetClientInput, GetClientResult, ListClientsInput, ListClientsResult };
export type { SubmitInteractionInput, SubmitInteractionResult };

export type Application = Readonly<{
  auth: OrangeConciergeAuth;
  interaction: {
    submit: (input: SubmitInteractionInput) => Promise<SubmitInteractionResult>;
  };
  client: {
    getAll: (input: ListClientsInput) => Promise<ListClientsResult>;
    getOne: (input: GetClientInput) => Promise<GetClientResult>;
  };
}>;
