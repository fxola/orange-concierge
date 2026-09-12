import { BadgeCheck, CircleDot } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { GROUP_META } from './group-meta';
import type { EvidenceHandlers, FactGroupKey, FactItem } from './types';

function FactValue({ value }: Readonly<{ value: string }>) {
  if (value.length <= 44 && !value.includes('\n')) {
    return (
      <span className="inline-flex max-w-full rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-foreground">
        {value}
      </span>
    );
  }

  return <p className="max-w-prose text-sm font-semibold leading-6 text-foreground">{value}</p>;
}

function FactRow({ item, onEvidenceOpen }: Readonly<{ item: FactItem }> & EvidenceHandlers) {
  const isSourced = Boolean(item.evidence);

  return (
    <button
      type="button"
      disabled={!isSourced}
      aria-label={
        isSourced ? `Show transcript evidence for ${item.label}: ${item.value}` : undefined
      }
      onClick={() => (item.evidence ? onEvidenceOpen(item.evidence) : undefined)}
      className={[
        'group/source grid w-full min-w-0 grid-cols-1 gap-2 rounded-none border border-transparent px-3 py-3 text-left transition-[background-color,border-color,transform] duration-150 ease-cubic sm:grid-cols-[148px_minmax(0,1fr)_112px] sm:items-start',
        isSourced
          ? 'cursor-pointer hover:border-border hover:bg-background/70 focus-visible:border-focus active:scale-[0.995]'
          : 'cursor-default opacity-80',
      ].join(' ')}
    >
      <span className="text-xs font-medium leading-5 text-muted-foreground">{item.label}</span>
      <span className="min-w-0">
        <FactValue value={item.value} />
      </span>
      <span className="grid w-fit gap-1 sm:justify-self-end sm:text-right">
        <span
          className={[
            'inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold sm:justify-self-end',
            isSourced
              ? 'bg-success-surface text-success'
              : 'bg-surface-muted text-subtle-foreground',
          ].join(' ')}
        >
          {isSourced ? (
            <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
          ) : (
            <CircleDot aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          {isSourced ? 'Source' : 'No source'}
        </span>
        {isSourced ? (
          <span className="h-4 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity duration-150 ease-cubic group-hover/source:opacity-100 group-focus-visible/source:opacity-100">
            Click to view proof
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function FactGroupCard({
  group,
  items,
  onEvidenceOpen,
}: Readonly<{
  group: FactGroupKey;
  items: readonly FactItem[];
}> &
  EvidenceHandlers) {
  if (items.length === 0) {
    return null;
  }

  const meta = GROUP_META[group];
  const sourcedCount = items.filter((item) => item.evidence).length;

  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface-raised shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="flex min-w-0 gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-foreground">
            {meta.icon}
          </span>
          <div className="min-w-0">
            <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
              {meta.eyebrow}
            </Text>
            <h4 className="mt-0.5 font-display text-lg font-medium leading-6">{meta.title}</h4>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {sourcedCount}/{items.length} sourced
        </span>
      </div>

      <div className="divide-y divide-border/70">
        {items.map((item) => (
          <FactRow key={item.path} item={item} onEvidenceOpen={onEvidenceOpen} />
        ))}
      </div>
    </section>
  );
}
