import type { OrangeConciergeAuth } from '../auth';
import type { SubmitInteractionInput, SubmitInteractionResult } from '@orange-concierge/core';

export type { SubmitInteractionInput, SubmitInteractionResult };

export type Application = Readonly<{
  auth: OrangeConciergeAuth;
  interaction: {
    submit: (input: SubmitInteractionInput) => Promise<SubmitInteractionResult>;
  };
}>;
