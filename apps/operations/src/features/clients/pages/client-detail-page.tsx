import { PageHeader } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import type { ClientRow } from '@/features/clients/view-models/clients';
import { ClientInteractionsSection } from '@/features/interactions/components/client-interactions-section';

export function ClientDetailPage({ client }: { client: ClientRow }) {
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
