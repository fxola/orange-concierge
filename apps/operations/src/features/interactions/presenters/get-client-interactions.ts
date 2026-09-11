import 'server-only';
import { getApplication } from '@orange-concierge/infrastructure';
import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  toClientInteractionsViewModel,
  type ClientInteractionsViewModel,
} from '@/features/interactions/view-models/interactions';

const LIST_LIMIT = 20;

export async function getClientInteractions(
  clientId: string
): Promise<ClientInteractionsViewModel> {
  try {
    const actor = await requirePageActor();
    const result = await getApplication().interaction.list({
      actor,
      clientId,
      limit: LIST_LIMIT,
      offset: 0,
    });

    return toClientInteractionsViewModel(result);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }
    return { status: 'unavailable' };
  }
}
