import type { ClientRow } from '@/features/clients/view-models/clients';
import type { InteractionCounts } from '@/lib/interaction-counts';

export function ClientDetailsCard({
  client,
  counts,
}: Readonly<{ client: ClientRow; counts: InteractionCounts }>) {
  const initial = client.displayName.trim().charAt(0).toUpperCase() || 'C';

  return (
    <section className="rounded-sm border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-surface text-sm font-semibold text-warning"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-medium">Client details</h2>
          <p className="truncate text-sm text-muted-foreground">{client.displayName}</p>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-border border-t border-border">
        <div className="py-3">
          <dt className="text-xs text-muted-foreground">Client ID</dt>
          <dd className="mt-1 break-all text-sm font-medium" title={client.id}>
            {client.id}
          </dd>
        </div>
        <div className="py-3">
          <dt className="text-xs text-muted-foreground">Client since</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">{client.createdAtLabel}</dd>
        </div>
        <div className="py-3">
          <dt className="text-xs text-muted-foreground">Review load</dt>
          <dd className="mt-1 text-sm font-medium">
            {counts.completed} complete · {counts.received} needs analysis · {counts.blocked} blocked
          </dd>
        </div>
      </dl>
    </section>
  );
}
