import { notFound } from 'next/navigation';

import { ClientDetailPage } from '@/features/clients/pages/client-detail-page';
import { getClientDetail } from '@/features/clients/presenters/get-client-detail';
import { getClientInteractions } from '@/features/interactions/presenters/get-client-interactions';

export default async function ClientDetailRoute({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const [vm, interactions] = await Promise.all([getClientDetail(id), getClientInteractions(id)]);

  if (vm.status === 'notFound') {
    notFound();
  }

  return <ClientDetailPage vm={vm} interactions={interactions} />;
}
