import 'server-only';
import { getApplication } from '@orange-concierge/infrastructure';
import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  toClientListViewModel,
  type ClientListViewModel,
} from '@/features/clients/view-models/clients';

const LIST_LIMIT = 20;

export async function getClients(): Promise<ClientListViewModel> {
  try {
    const actor = await requirePageActor();
    const result = await getApplication().client.getAll({
      actor,
      limit: LIST_LIMIT,
      offset: 0,
    });

    return toClientListViewModel(result);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { status: 'unavailable' };
  }
}
