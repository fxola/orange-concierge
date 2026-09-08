import { ApiError, api } from '@/lib/api-client';

import {
  toSubmitErrorViewModel,
  type SubmitInteractionViewModel,
} from '@/features/interactions/view-models/submit-interaction';

export type SubmitInteractionInput = Readonly<{
  clientId: string;
  transcript: string;
}>;

type SubmitInteractionResponse = Readonly<{
  id: string;
  status: string;
}>;

export async function submitInteraction(
  input: SubmitInteractionInput,
): Promise<SubmitInteractionViewModel> {
  try {
    const response = await api.post<SubmitInteractionResponse>('/api/interactions', input);
    return { status: 'ok', interactionId: response.id };
  } catch (error) {
    if (error instanceof ApiError) {
      return toSubmitErrorViewModel(error);
    }
    throw error;
  }
}
