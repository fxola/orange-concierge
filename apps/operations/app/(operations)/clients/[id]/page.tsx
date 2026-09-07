import { notFound } from 'next/navigation';

import { ClientDetailPage } from '@/features/clients/pages/client-detail-page';
import { getClientDetail } from '@/features/clients/presenters/get-client-detail';

export default async function ClientDetailRoute({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const vm = await getClientDetail(id);

  if (vm.status === 'notFound') {
    notFound();
  }

  return <ClientDetailPage client={vm.client} />;
}
