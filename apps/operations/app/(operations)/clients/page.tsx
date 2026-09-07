import { ClientsPage } from '@/features/clients/pages/clients-page';
import { getClients } from '@/features/clients/presenters/get-clients';

export default async function ClientsRoute() {
  const vm = await getClients();

  return <ClientsPage vm={vm} />;
}
