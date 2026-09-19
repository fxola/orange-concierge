'use client';

import { AlertTriangle } from 'lucide-react';
import { GROUP_META } from '../group-meta';
import { ExtractedFactValue } from './extracted-fact-value';
import type { ConfirmableSectionProps } from './section-props';
import { VerifyToggle } from './verify-toggle';

export function NeedsReviewSection({
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
      aria-label="Needs review"
      className="overflow-hidden rounded-sm border border-warning/40 bg-surface shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="inline-flex items-center gap-2 font-display text-lg font-medium">
          <AlertTriangle aria-hidden="true" className="h-4 w-4 text-warning" />
          Needs review
        </h3>
        <span className="rounded-full bg-warning-surface px-2.5 py-1 text-xs font-medium text-warning">
          {items.length} to confirm
        </span>
      </div>
      <div className="divide-y divide-border/70">
        {items.map((item) => (
          <div key={item.path} className="grid gap-2 px-4 py-3.5">
            <p className="text-xs font-medium text-muted-foreground">
              {GROUP_META[item.group].title} · {item.label}
            </p>
            <ExtractedFactValue value={item.value} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
                <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
                No transcript proof — confirm against the transcript
              </p>
              {canVerifyFacts ? (
                <VerifyToggle
                  factPath={item.path}
                  verified={false}
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
