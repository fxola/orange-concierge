export type InteractionFilterTab = 'all' | 'received' | 'completed' | 'blocked';

export type InteractionTabCounts = Readonly<{
  total: number;
  received: number;
  completed: number;
  blocked: number;
}>;

const TABS: ReadonlyArray<
  Readonly<{ id: InteractionFilterTab; label: string; count: (counts: InteractionTabCounts) => number }>
> = [
  { id: 'all', label: 'All', count: (counts) => counts.total },
  { id: 'received', label: 'Needs analysis', count: (counts) => counts.received },
  { id: 'completed', label: 'Complete', count: (counts) => counts.completed },
  { id: 'blocked', label: 'Blocked', count: (counts) => counts.blocked },
];

export function InteractionFilterTabs({
  active,
  counts,
  onChange,
}: Readonly<{
  active: InteractionFilterTab;
  counts: InteractionTabCounts;
  onChange: (tab: InteractionFilterTab) => void;
}>) {
  return (
    <div
      role="tablist"
      aria-label="Filter interactions by status"
      className="mt-4 flex gap-5 overflow-x-auto border-b border-border px-5 sm:px-6"
    >
      {TABS.map((item) => {
        const selected = active === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onChange(item.id)}
            className={[
              'flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 pb-2.5 text-sm transition-colors',
              selected
                ? 'border-foreground font-semibold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {item.label}
            <span className="text-xs tabular-nums opacity-70">{item.count(counts)}</span>
          </button>
        );
      })}
    </div>
  );
}
