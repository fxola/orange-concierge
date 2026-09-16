import type { ClientDetailViewModel } from '@/features/clients/view-models/clients';
import type { InteractionDetailViewModel } from '../view-models/interactions';
import { InteractionDetailHeader } from '../components/interaction-detail/interaction-detail-header';
import { InteractionDetailUnavailable } from '../components/interaction-detail/interaction-detail-unavailable';
import { InteractionDetailTabs } from '../components/interaction-detail/interaction-detail-tabs';
import Link from 'next/link';

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
      <Link
        href={`/clients/${client.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">←</span> Back to {client.displayName}
      </Link>
      <InteractionDetailHeader row={row} />
      <InteractionDetailTabs row={row} />
    </div>
  );
}
