import Link from 'next/link';

import { AUDIT_ACTION_LABELS } from '../view-models/audit-trail';
import type { AuditAction } from '@orange-concierge/core';

const ACTION_VALUES = Object.keys(AUDIT_ACTION_LABELS) as AuditAction[];

function hrefFor(action?: AuditAction): string {
  return action ? `/audit?action=${action}` : '/audit';
}

export function AuditFilterTabs({ active }: Readonly<{ active?: AuditAction }>) {
  return (
    <div className="flex flex-wrap gap-1.5" role="navigation" aria-label="Filter by event type">
      <Link
        href={hrefFor()}
        aria-current={active === undefined ? 'page' : undefined}
        className={[
          'rounded-full px-3 py-1 text-xs font-semibold transition-[background-color,color,transform] duration-150 ease-cubic active:scale-[0.97]',
          active === undefined
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-surface-muted/60 text-muted-foreground hover:text-foreground',
        ].join(' ')}
      >
        All events
      </Link>
      {ACTION_VALUES.map((action) => (
        <Link
          key={action}
          href={hrefFor(action)}
          aria-current={active === action ? 'page' : undefined}
          className={[
            'rounded-full px-3 py-1 text-xs font-semibold transition-[background-color,color,transform] duration-150 ease-cubic active:scale-[0.97]',
            active === action
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-surface-muted/60 text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {AUDIT_ACTION_LABELS[action]}
        </Link>
      ))}
    </div>
  );
}
