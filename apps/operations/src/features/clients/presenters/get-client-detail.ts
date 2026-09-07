import 'server-only';
import { getApplication } from '@orange-concierge/infrastructure';
import { requirePageActor } from '@/server/actor';
import {
  toClientDetailViewModel,
  type ClientDetailViewModel,
} from '@/features/clients/view-models/clients';

export async function getClientDetail(clientId: string): Promise<ClientDetailViewModel> {
  const actor = await requirePageActor();

  const result = await getApplication().client.getOne({ actor, clientId });

  return toClientDetailViewModel(result);
}
