import Link from 'next/link';

import { countInteractionRows } from '@/lib/interaction-counts';
import { shortId } from '@/lib/short-id';
import { TableEmpty } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import type { ClientDetailViewModel } from '@/features/clients/view-models/clients';
import { ClientInteractionsSection } from '@/features/interactions/components/client-interactions-section';
import type { ClientInteractionsViewModel } from '@/features/interactions/view-models/interactions';
import { ClientDetailsCard } from '../components/client-details-card';
import { ClientOverview } from '../components/client-overview';
import { ReviewFlowCard } from '../components/review-flow-card';

export function ClientDetailPage({
  vm,
  interactions,
}: {
  vm: ClientDetailViewModel;
  interactions: ClientInteractionsViewModel;
}) {
  if (vm.status === 'unavailable') {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <Text variant="display">{'Client'}</Text>
        <Text tone="muted" className="mt-1">
          Client record.
        </Text>
        <div className="mt-6 overflow-hidden rounded-sm border border-border bg-surface">
          <TableEmpty
            title="Couldn't load this client"
            description="The record is unreachable right now. Nothing was lost."
            action={
              <Link
                href="/clients"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                Back to clients
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  if (vm.status === 'notFound') {
    return null;
  }

  const { client } = vm;
  const rows = interactions.status === 'ok' ? interactions.rows : [];
  const counts = countInteractionRows(rows);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">←</span> Back to clients
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Text variant="display" as="h1" className="tracking-[-0.01em]">
            {client.displayName}
          </Text>
          <Text tone="muted" variant="small" className="mt-2">
            Client since {client.createdAtLabel} · #{shortId(client.id)}
          </Text>
        </div>
      </div>

      <ClientOverview total={rows.length} {...counts} />

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ClientInteractionsSection
          client={{ id: client.id, displayName: client.displayName }}
          interactions={interactions}
        />

        <aside className="grid gap-6 xl:sticky xl:top-20">
          <ClientDetailsCard client={client} counts={counts} />
          <ReviewFlowCard />
        </aside>
      </div>
    </div>
  );
}
