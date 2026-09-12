import { notFound } from 'next/navigation';

import { getClientDetail } from '@/features/clients/presenters/get-client-detail';
import { getInteractionDetail } from '@/features/interactions/presenters/get-interaction-detail';
import { InteractionDetailPage } from '@/features/interactions/pages/interaction-detail-page';

export default async function InteractionDetailRoute({
  params,
}: Readonly<{ params: Promise<{ id: string; interactionId: string }> }>) {
  const { id, interactionId } = await params;
  const [clientVm, interactionVm] = await Promise.all([
    getClientDetail(id),
    getInteractionDetail(id, interactionId),
  ]);

  if (clientVm.status === 'notFound' || interactionVm.status === 'notFound') {
    notFound();
  }

  return <InteractionDetailPage clientVm={clientVm} interactionVm={interactionVm} />;
}
