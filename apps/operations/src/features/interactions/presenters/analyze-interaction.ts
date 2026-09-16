import { ApiError, api } from '@/lib/api-client';
import {
  AnalyzeInteractionViewModel,
  toAnalyzeErrorViewModel,
} from '../view-models/analyse-interaction';

type AnalyzeInteractionResponse = Readonly<{
  id: string;
  status: string;
}>;

export async function analyzeInteraction(
  interactionId: string
): Promise<AnalyzeInteractionViewModel> {
  try {
    const response = await api.post<AnalyzeInteractionResponse>(
      `/api/interactions/${interactionId}/analyze`,
      {}
    );
    return { status: 'ok', interactionStatus: response.status };
  } catch (error) {
    if (error instanceof ApiError) {
      return toAnalyzeErrorViewModel(error);
    }
    throw error;
  }
}
