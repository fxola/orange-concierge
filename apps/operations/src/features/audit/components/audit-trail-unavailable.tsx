import Link from 'next/link';

import { PageHeader, TableEmpty } from '@/components/ui/page';

export function AuditTrailUnavailable() {
  return (
    <>
      <PageHeader title="Audit trail" description="Who did what, and when." />
      <div className="overflow-hidden rounded-none border border-border bg-surface">
        <TableEmpty
          title="Couldn't load the audit trail"
          description="The records are unreachable right now. Nothing was lost."
          action={
            <Link
              href="/audit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
            >
              Try again
            </Link>
          }
        />
      </div>
    </>
  );
}
