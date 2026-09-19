'use client';

import { Check } from 'lucide-react';
import { GROUP_META } from '../group-meta';
import { ExtractedFactValue } from './extracted-fact-value';
import type { ConfirmableSectionProps } from './section-props';
import { VerifyToggle } from './verify-toggle';

export function ConfirmedByConsultantSection({
  items,
  canVerifyFacts,
  pendingPath,
  onToggle,
}: ConfirmableSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Confirmed by consultant"
      className="overflow-hidden rounded-sm border border-info/40 bg-surface shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="inline-flex items-center gap-2 font-display text-lg font-medium">
          <Check aria-hidden="true" className="h-4 w-4 text-info" />
          Confirmed by consultant
        </h3>
        <span className="rounded-full bg-info-surface px-2.5 py-1 text-xs font-medium text-info">
          {items.length} confirmed
        </span>
      </div>
      <p className="px-4 pt-3 text-sm leading-6 text-muted-foreground">
        These count toward coverage, but they do not create transcript proof quotes. Recommendations
        still cite only machine-resolved evidence.
      </p>
      <div className="divide-y divide-border/70">
        {items.map((item) => (
          <div key={item.path} className="grid gap-2 px-4 py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {GROUP_META[item.group].title} · {item.label}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-info-surface px-2 py-1 text-[11px] font-semibold text-info">
                <Check aria-hidden="true" className="h-3.5 w-3.5" /> Confirmed by you
              </span>
            </div>
            <ExtractedFactValue value={item.value} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs leading-5 text-muted-foreground">
                No transcript proof — kept covered by your confirmation.
              </p>
              {canVerifyFacts ? (
                <VerifyToggle
                  factPath={item.path}
                  verified
                  disabled={pendingPath !== null}
                  pending={pendingPath === item.path}
                  onToggle={onToggle}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
