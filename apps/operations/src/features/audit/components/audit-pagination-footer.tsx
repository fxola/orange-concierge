import Link from 'next/link';

function pageHref(page: number, action?: string): string {
  const params = new URLSearchParams();
  if (action) {
    params.set('action', action);
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query ? `/audit?${query}` : '/audit';
}

const pagerButtonClassName = [
  'inline-flex h-8 items-center justify-center rounded-sm border border-border bg-surface px-3',
  'text-sm font-semibold transition-[background-color,color,transform] duration-150 ease-cubic',
  'hover:bg-surface-muted active:scale-[0.97]',
].join(' ');

export function AuditPaginationFooter({
  page,
  totalPages,
  total,
  action,
}: Readonly<{ page: number; totalPages: number; total: number; action?: string }>) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground tabular-nums">
        Page {page} of {totalPages} · {total} {total === 1 ? 'event' : 'events'}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={pageHref(page - 1, action)} className={pagerButtonClassName}>
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={pageHref(page + 1, action)} className={pagerButtonClassName}>
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
