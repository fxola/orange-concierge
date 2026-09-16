import { notFound } from 'next/navigation';

import { getClientDetail } from '@/features/clients/presenters/get-client-detail';
import { getInteractionDetail } from '@/features/interactions/presenters/get-interaction-detail';
import { getRecommendations } from '@/features/interactions/presenters/get-recommendations';
import { InteractionDetailPage } from '@/features/interactions/pages/interaction-detail-page';

export default async function InteractionDetailRoute({
  params,
}: Readonly<{ params: Promise<{ id: string; interactionId: string }> }>) {
  const { id, interactionId } = await params;
  const [clientVm, interactionVm, recommendationsVm] = await Promise.all([
    getClientDetail(id),
    getInteractionDetail(id, interactionId),
    getRecommendations(interactionId),
  ]);

  if (clientVm.status === 'notFound' || interactionVm.status === 'notFound') {
    notFound();
  }

  return (
    <InteractionDetailPage
      clientVm={clientVm}
      interactionVm={interactionVm}
      recommendationsVm={recommendationsVm}
    />
  );
}
