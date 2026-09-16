import type { GroundedRecommendation } from '@orange-concierge/core';

import { ApiError, api } from '@/lib/api-client';
import {
  GenerateRecommendationsViewModel,
  toGenerateRecommendationsErrorViewModel,
} from '../view-models/generate-recommendations';

type GenerateRecommendationsResponse = Readonly<{
  recommendations: readonly GroundedRecommendation[];
}>;

export async function generateRecommendations(
  interactionId: string
): Promise<GenerateRecommendationsViewModel> {
  try {
    const response = await api.post<GenerateRecommendationsResponse>(
      `/api/interactions/${interactionId}/recommendations`,
      {}
    );
    return { status: 'ok', recommendations: response.recommendations };
  } catch (error) {
    if (error instanceof ApiError) {
      return toGenerateRecommendationsErrorViewModel(error);
    }
    throw error;
  }
}
