import { PageHeader, TableEmpty } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import type { ClientRow } from '@/features/clients/view-models/clients';

export function ClientDetailPage({ client }: { client: ClientRow }) {
  return (
    <>
      <PageHeader title={client.displayName} description="Client record." />
      <div className="grid gap-6">
        <div className="rounded-none border border-border bg-surface p-6">
          <Text tone="muted" variant="small">
            Client ID
          </Text>
          <Text className="mt-1 break-all">{client.id}</Text>
          <Text tone="muted" variant="small" className="mt-4">
            Client since
          </Text>
          <Text className="mt-1">{client.createdAtLabel}</Text>
        </div>
        <div>
          <Text variant="h2">Interactions</Text>
          <div className="mt-3 overflow-hidden rounded-none border border-border bg-surface">
            <TableEmpty
              title="No interactions yet"
              description="Submitted meeting notes will appear here."
            />
          </div>
        </div>
      </div>
    </>
  );
}
