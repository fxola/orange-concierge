import Link from 'next/link';
import type { ReadinessScore } from '@orange-concierge/core';

import { Alert } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { shortId } from '@/lib/short-id';
import type { InteractionRow } from '../../view-models/interactions';
import { InteractionAnalyzeButton } from '../interaction-analyze-button';
import { InteractionStatus } from '../interaction-status';

function ReadinessChip({ readinessScore }: Readonly<{ readinessScore?: ReadinessScore }>) {
  if (!readinessScore) {
    return null;
  }

  return (
    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      Readiness {readinessScore.overall.score}/100
    </span>
  );
}

export function InteractionDetailHeader({ row }: Readonly<{ row: InteractionRow }>) {
  return (
    <>
      <header className="mt-3 rounded-sm border border-border bg-surface px-5 py-5 shadow-xs sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
              Interaction #{shortId(row.id)}
            </Text>
            <h1 className="mt-1 font-display text-4xl font-medium leading-[1.1] tracking-[-0.02em]">
              Client interaction detail
            </h1>
            <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <InteractionStatus status={row.status} />
              <span aria-hidden="true" className="text-border-strong">
                ·
              </span>
              <span className="tabular-nums">{row.createdAtLabel}</span>
              <ReadinessChip readinessScore={row.readinessScore} />
            </p>
          </div>

          {row.status === 'received' ? <InteractionAnalyzeButton interactionId={row.id} /> : null}
        </div>
      </header>

      {row.status === 'analysis_blocked' ? (
        <Alert tone="danger" className="mt-4 rounded-sm">
          Sensitive material detected. This transcript was not sent to the model.
        </Alert>
      ) : null}
    </>
  );
}
