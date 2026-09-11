import { ApiError, api } from '@/lib/api-client';

export type AnalyzeInteractionViewModel =
  | Readonly<{ status: 'ok'; interactionStatus: string }>
  | Readonly<{ status: 'error'; message: string; unauthorized: boolean }>;

function error(message: string, unauthorized = false): AnalyzeInteractionViewModel {
  return { status: 'error', message, unauthorized };
}

function toAnalyzeErrorViewModel(failure: ApiError): AnalyzeInteractionViewModel {
  if (failure.status === 401 || failure.code === 'unauthorized') {
    return error('Please sign in to analyze interactions.', true);
  }

  if (failure.status === 403 || failure.code === 'forbidden') {
    return error('Your role cannot analyze interactions.', false);
  }

  if (failure.status === 404 || failure.code === 'interaction_not_found') {
    return error('That interaction no longer exists.', false);
  }

  if (failure.status === 409 || failure.code === 'invalid_interaction_state') {
    return error('This interaction was already analyzed.', false);
  }

  if (failure.code === 'interaction_analysis_failed') {
    return error('Analysis failed. The model may be unavailable — try again.', false);
  }

  return error('Something went wrong. Try again.', false);
}

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
