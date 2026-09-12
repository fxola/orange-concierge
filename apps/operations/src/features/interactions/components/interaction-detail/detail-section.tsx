import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export function DetailSection({
  title,
  description,
  defaultOpen,
  children,
}: Readonly<{
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}>) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-sm border border-border bg-surface shadow-xs"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-background/70 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-display text-xl font-medium leading-7 text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-180"
        />
      </summary>
      <div className="border-t border-border px-5 py-5 sm:px-6">{children}</div>
    </details>
  );
}
