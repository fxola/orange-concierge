import 'server-only';

import { getApplication } from '@orange-concierge/infrastructure';
import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  toInteractionDetailViewModel,
  type InteractionDetailViewModel,
} from '@/features/interactions/view-models/interactions';

export async function getInteractionDetail(
  clientId: string,
  interactionId: string
): Promise<InteractionDetailViewModel> {
  try {
    const actor = await requirePageActor();
    const result = await getApplication().interaction.getOne({ actor, clientId, interactionId });

    return toInteractionDetailViewModel(result, actor);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { status: 'unavailable' };
  }
}
