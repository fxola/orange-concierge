import 'server-only';
import { getApplication } from '@orange-concierge/infrastructure';
import { requirePageActor } from '@/server/actor';
import {
  toClientListViewModel,
  type ClientListViewModel,
} from '@/features/clients/view-models/clients';

const LIST_LIMIT = 20;

export async function getClients(): Promise<ClientListViewModel> {
  const actor = await requirePageActor();

  const result = await getApplication().client.getAll({
    actor,
    limit: LIST_LIMIT,
    offset: 0,
  });

  return toClientListViewModel(result);
}
