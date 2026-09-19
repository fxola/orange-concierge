import Link from 'next/link';

import type { AuditTrailRow } from '@/features/audit/view-models/audit-trail';
import { AuditActionDot } from './audit-action-dot';

export function AuditTableRow({ row }: Readonly<{ row: AuditTrailRow }>) {
  return (
    <tr className="h-[72px]">
      <td className="w-36 whitespace-nowrap tabular-nums">{row.occurredAtLabel}</td>
      <td className="w-60">
        <span className="flex items-center gap-2">
          <AuditActionDot action={row.action} />
          <span className="truncate font-medium">{row.actionLabel}</span>
        </span>
      </td>
      <td className="w-48">
        <span className="block truncate">{row.actorRole}</span>
      </td>
      <td className="w-48">
        {row.resourceHref ? (
          <Link
            href={row.resourceHref}
            className="block truncate font-medium text-primary hover:underline"
          >
            {row.resourceLabel}
          </Link>
        ) : (
          <span className="block truncate">{row.resourceLabel}</span>
        )}
      </td>
      <td>
        {row.details.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <ul className="grid gap-0.5 line-clamp-2">
            {row.details.map((detail) => (
              <li key={detail.label} className="truncate text-xs leading-5">
                <span className="text-muted-foreground">{detail.label}: </span>
                <span className="tabular-nums">{detail.value}</span>
              </li>
            ))}
          </ul>
        )}
      </td>
    </tr>
  );
}
