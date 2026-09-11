import { Search } from 'lucide-react';

export function InteractionSearch({
  value,
  shown,
  total,
  onChange,
}: Readonly<{
  value: string;
  shown: number;
  total: number;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 sm:px-6">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search transcripts"
          aria-label="Search transcripts"
          className="h-9 w-full rounded-sm bg-surface-muted/60 pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-surface-muted"
        />
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {shown} of {total}
      </span>
    </div>
  );
}
