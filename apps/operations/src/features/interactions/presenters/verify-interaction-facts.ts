import { ApiError, api } from '@/lib/api-client';
import {
  toVerifyFactsErrorViewModel,
  type VerifyFactsViewModel,
} from '../view-models/verify-facts';

export async function verifyInteractionFacts(
  interactionId: string,
  factPaths: readonly string[]
): Promise<VerifyFactsViewModel> {
  try {
    await api.post(`/api/interactions/${interactionId}/verify-facts`, { factPaths });
    return { status: 'ok' };
  } catch (error) {
    if (error instanceof ApiError) {
      return toVerifyFactsErrorViewModel(error);
    }
    throw error;
  }
}
