import { Text } from '@/components/ui/text';

function OverviewStat({
  dot,
  label,
  value,
}: Readonly<{ dot: string; label: string; value: number }>) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className={['h-2 w-2 rounded-full', dot].join(' ')} />
      <Text variant="small" tone="muted">
        {value} {label}
      </Text>
    </div>
  );
}

export function ClientOverview({
  total,
  received,
  completed,
  blocked,
}: Readonly<{ total: number; received: number; completed: number; blocked: number }>) {
  return (
    <div className="mt-6 rounded-sm bg-surface-muted/70 px-6 py-5 sm:px-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            Total interactions
          </Text>
          <p className="mt-1 font-display text-4xl font-medium tabular-nums">{total}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <OverviewStat dot="bg-info" label="ready" value={received} />
          <OverviewStat dot="bg-success" label="complete" value={completed} />
          <OverviewStat dot="bg-danger" label="blocked" value={blocked} />
        </div>
      </div>
    </div>
  );
}
