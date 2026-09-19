import { Check } from 'lucide-react';
import type { ReadinessScore } from '@orange-concierge/core';
import type { StepState } from '../../../view-models/interaction-workflow';

export function ReadinessChip({ readinessScore }: Readonly<{ readinessScore?: ReadinessScore }>) {
  if (!readinessScore) {
    return null;
  }

  return (
    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      Readiness {readinessScore.overall.score}/100
    </span>
  );
}

export function StepBadge({ state, index }: Readonly<{ state: StepState; index: number }>) {
  if (state === 'done') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-surface text-success"
      >
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }

  if (state === 'error') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger-surface text-danger"
      >
        <span className="text-xs font-bold">!</span>
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        state === 'current'
          ? 'bg-info-surface text-info'
          : 'bg-surface-muted text-muted-foreground',
      ].join(' ')}
    >
      <span>{index + 1}</span>
    </span>
  );
}
