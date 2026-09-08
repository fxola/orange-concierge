import 'server-only';
import { getApplication } from '@orange-concierge/infrastructure';
import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  toClientDetailViewModel,
  type ClientDetailViewModel,
} from '@/features/clients/view-models/clients';

export async function getClientDetail(clientId: string): Promise<ClientDetailViewModel> {
  try {
    const actor = await requirePageActor();
    const result = await getApplication().client.getOne({ actor, clientId });

    return toClientDetailViewModel(result);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }
    return { status: 'unavailable' };
  }
}
