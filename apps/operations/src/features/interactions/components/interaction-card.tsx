import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { shortId } from '@/lib/short-id';
import type { InteractionRow } from '../view-models/interactions';
import { InteractionStatus } from './interaction-status';

function transcriptPreview(transcript: string): string {
  const compact = transcript.trim().replace(/\s+/g, ' ');

  if (compact.length <= 120) {
    return compact;
  }

  return `${compact.slice(0, 120)}...`;
}

function readinessLabel(row: InteractionRow): string | null {
  const readiness = row.readinessScore?.overall;
  if (!readiness) {
    return null;
  }

  if (readiness.level === 'ready') {
    return `Ready · ${readiness.score}/100`;
  }

  if (readiness.level === 'developing') {
    return `Developing · ${readiness.score}/100`;
  }

  return `Needs attention · ${readiness.score}/100`;
}

function interactionCue(row: InteractionRow): string {
  const readiness = readinessLabel(row);
  if (readiness) {
    return readiness;
  }

  if (row.status === 'analysis_blocked') {
    return 'Sensitive material blocked';
  }

  return 'Analysis pending';
}

export function InteractionCard({ row }: Readonly<{ row: InteractionRow }>) {
  return (
    <Link
      href={`/clients/${row.clientId}/interactions/${row.id}`}
      className="group block rounded-sm border border-border bg-surface px-5 py-4 shadow-xs transition-[background-color,border-color,transform] duration-150 ease-cubic hover:border-border-strong hover:bg-background/70 active:scale-[0.998] sm:px-6"
    >
      <article>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <InteractionStatus status={row.status} />
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <span className="text-subtle-foreground">#{shortId(row.id)}</span>
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <span className="text-muted-foreground tabular-nums">{row.createdAtLabel}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
            Open details
            <ArrowRight
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </span>
        </div>

        <p className="mt-2 line-clamp-1 text-sm leading-5 text-foreground">
          {transcriptPreview(row.transcript)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle-foreground">
          <span className="rounded-full bg-surface-muted px-2.5 py-1 font-semibold">
            {interactionCue(row)}
          </span>
        </div>
      </article>
    </Link>
  );
}
