import 'server-only';

import { getApplication } from '@orange-concierge/infrastructure';
import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  toRecommendationsViewModel,
  type RecommendationsViewModel,
} from '@/features/interactions/view-models/recommendations';

export async function getRecommendations(
  interactionId: string
): Promise<RecommendationsViewModel> {
  try {
    const actor = await requirePageActor();
    const result = await getApplication().recommendations.list({
      actor,
      interactionId,
    });

    return toRecommendationsViewModel(result);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { status: 'unavailable' };
  }
}
