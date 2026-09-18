import Link from 'next/link';

import type { AuditTrailRow } from '@/features/audit/view-models/audit-trail';
import { AuditActionDot } from './audit-action-dot';

export function AuditEventCard({ row }: Readonly<{ row: AuditTrailRow }>) {
  return (
    <article className="rounded-sm border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <AuditActionDot action={row.action} />
          <span className="truncate text-sm font-medium">{row.actionLabel}</span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {row.occurredAtLabel}
        </span>
      </div>
      <p className="mt-1.5 truncate text-xs text-muted-foreground">
        {row.actorLabel} ({row.actorRole})
      </p>
      <div className="mt-1.5 text-sm">
        {row.resourceHref ? (
          <Link
            href={row.resourceHref}
            className="block truncate font-medium text-primary hover:underline"
          >
            {row.resourceLabel}
          </Link>
        ) : (
          <span className="block truncate text-muted-foreground">{row.resourceLabel}</span>
        )}
      </div>
      {row.details.length > 0 ? (
        <ul className="mt-2 grid gap-0.5 border-t border-border pt-2">
          {row.details.map((detail) => (
            <li key={detail.label} className="truncate text-xs leading-5">
              <span className="text-muted-foreground">{detail.label}: </span>
              <span className="tabular-nums">{detail.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
