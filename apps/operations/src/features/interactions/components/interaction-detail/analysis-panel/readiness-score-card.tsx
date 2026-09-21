import { useId } from 'react';
import type { ReadinessScore } from '@orange-concierge/core';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/card';
import {
  readinessLabel,
  readinessScoreLabel,
  readinessTone,
  readinessTranslation,
} from '../../../view-models/readiness-presentation';

function ScoreHelp({ score }: Readonly<{ score: ReadinessScore }>) {
  const tooltipId = useId();

  return (
    <span className="group/help relative inline-flex">
      <button
        type="button"
        aria-label="Explain readiness score"
        aria-describedby={tooltipId}
        className="inline-flex cursor-help h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground focus-visible:border-focus focus-visible:text-foreground focus-visible:outline-none"
      >
        <Info aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 top-9 z-20 w-72 max-w-[calc(100vw-3rem)] rounded-sm border border-border bg-surface-raised p-3 text-left text-xs leading-5 text-muted-foreground opacity-0 shadow-md transition-[opacity,transform] duration-150 ease-cubic group-hover/help:translate-y-0 group-hover/help:opacity-100 group-focus-within/help:translate-y-0 group-focus-within/help:opacity-100 sm:w-80"
      >
        <span className="block font-semibold text-foreground">What this score means</span>
        <span className="mt-1 block">
          Operational readiness from extracted custody and security facts. It is not model
          confidence, approval, or advice.
        </span>
        <span className="mt-2 block border-t border-border pt-2 tabular-nums">
          Custody {readinessScoreLabel(score.custody.score)} · Security{' '}
          {readinessScoreLabel(score.cybersecurity.score)}
        </span>
      </span>
    </span>
  );
}

export function ReadinessScoreCard({ score }: Readonly<{ score?: ReadinessScore }>) {
  if (!score) {
    return null;
  }

  return (
    <aside className="rounded-md border border-border bg-background/70 p-4 shadow-xs lg:justify-self-end">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Readiness
          </span>
          <p className="mt-1 font-display text-2xl font-medium leading-7 text-foreground">
            {readinessLabel(score.overall.level)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={readinessTone(score.overall.level)}>
            {readinessScoreLabel(score.overall.score)}
          </Badge>
          <ScoreHelp score={score} />
        </div>
      </div>

      <p className="mt-2 text-sm leading-5 text-muted-foreground">
        {readinessTranslation(score.overall.level)}
      </p>
    </aside>
  );
}
