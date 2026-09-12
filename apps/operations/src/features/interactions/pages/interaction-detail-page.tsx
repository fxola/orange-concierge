import type { ClientDetailViewModel } from '@/features/clients/view-models/clients';
import type { InteractionDetailViewModel } from '../view-models/interactions';
import {
  InteractionDetailBackLink,
  InteractionDetailHeader,
} from '../components/interaction-detail/interaction-detail-header';
import { InteractionDetailSections } from '../components/interaction-detail/interaction-detail-sections';
import { InteractionDetailUnavailable } from '../components/interaction-detail/interaction-detail-unavailable';

export function InteractionDetailPage({
  clientVm,
  interactionVm,
}: Readonly<{
  clientVm: ClientDetailViewModel;
  interactionVm: InteractionDetailViewModel;
}>) {
  if (clientVm.status === 'notFound' || interactionVm.status === 'notFound') {
    return null;
  }

  if (clientVm.status === 'unavailable' || interactionVm.status === 'unavailable') {
    return <InteractionDetailUnavailable />;
  }

  const { client } = clientVm;
  const row = interactionVm.row;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <InteractionDetailBackLink clientId={client.id} displayName={client.displayName} />
      <InteractionDetailHeader row={row} />
      <InteractionDetailSections row={row} />
    </div>
  );
}
