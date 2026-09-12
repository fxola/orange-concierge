import Link from 'next/link';

import { TableEmpty } from '@/components/ui/page';

export function InteractionDetailUnavailable() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <TableEmpty
          title="Couldn't load this interaction"
          description="The interaction detail is unreachable right now. Nothing was lost."
          action={
            <Link
              href="/clients"
              className="inline-flex h-10 items-center justify-center rounded-none bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
            >
              Back to clients
            </Link>
          }
        />
      </div>
    </div>
  );
}
