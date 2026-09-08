import Link from 'next/link';

import { PageHeader, TableEmpty } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import type { ClientDetailViewModel } from '@/features/clients/view-models/clients';
import { ClientInteractionsSection } from '@/features/interactions/components/client-interactions-section';

export function ClientDetailPage({ vm }: { vm: ClientDetailViewModel }) {
  if (vm.status === 'unavailable') {
    return (
      <>
        <PageHeader title="Client" description="Client record." />
        <div className="overflow-hidden rounded-none border border-border bg-surface">
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
      </>
    );
  }

  if (vm.status === 'notFound') {
    return null;
  }

  const { client } = vm;
  return (
    <>
      <PageHeader title={client.displayName} description="Client record." />
      <div className="grid gap-6 lg:w-2/3">
        <div className="rounded-none border border-border bg-surface p-6 mb-4">
          <Text tone="muted" variant="small">
            Client ID
          </Text>
          <Text className="mt-1 break-all">{client.id}</Text>
          <Text tone="muted" variant="small" className="mt-4">
            Client since
          </Text>
          <Text className="mt-1">{client.createdAtLabel}</Text>
        </div>
        <ClientInteractionsSection client={{ id: client.id, displayName: client.displayName }} />
      </div>
    </>
  );
}
