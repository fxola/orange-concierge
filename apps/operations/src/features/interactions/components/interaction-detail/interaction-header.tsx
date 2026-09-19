'use client';

import { Alert } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { InteractionRow } from '../../view-models/interactions';
import {
  getNextStep,
  workflowSteps,
  type InteractionDetailTabKey,
} from '../../view-models/interaction-workflow';
import type { RecommendationsViewModel } from '../../view-models/recommendations';
import { InteractionAnalyzeButton } from '../interaction-analyze-button';
import { InteractionStatus } from '../interaction-status';
import { ReadinessChip, StepBadge } from './interaction-header/header-badges';
import { CopyIdButton } from './interaction-header/copy-id-button';

export type { InteractionDetailTabKey };

export function InteractionHeader({
  row,
  recommendationsVm,
  onSelectTab,
}: Readonly<{
  row: InteractionRow;
  recommendationsVm: RecommendationsViewModel;
  onSelectTab: (tab: InteractionDetailTabKey) => void;
}>) {
  const step = getNextStep(row, recommendationsVm);
  const steps = workflowSteps(row, recommendationsVm);

  return (
    <>
      <section
        aria-label="Interaction status and next step"
        className="rounded-sm border border-border bg-surface px-5 py-5 shadow-xs sm:px-6"
      >
        <ol aria-label="Workflow progress" className="flex items-center gap-1 sm:gap-2">
          {steps.map((item, index) => (
            <li key={item.label} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <StepBadge state={item.state} index={index} />
                <span
                  className={[
                    'truncate text-xs font-semibold sm:text-sm',
                    item.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                  ].join(' ')}
                >
                  {item.label}
                  {item.state === 'current' ? (
                    <span className="sr-only"> (current step)</span>
                  ) : null}
                  {item.state === 'error' ? <span className="sr-only"> (blocked)</span> : null}
                </span>
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={[
                    'mx-1 h-px min-w-3 flex-1 sm:mx-2',
                    item.state === 'done' ? 'bg-success' : 'bg-border',
                  ].join(' ')}
                />
              ) : null}
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
              Next step
            </Text>
            <h2 className="mt-1 text-base font-semibold tracking-[-0.01em]">{step.title}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
          </div>
          <span className="inline-flex shrink-0 flex-wrap items-center gap-2">
            {row.status === 'received' ? <InteractionAnalyzeButton interactionId={row.id} /> : null}
            {step.actionLabel && step.targetTab ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onSelectTab(step.targetTab as InteractionDetailTabKey)}
              >
                {step.actionLabel}
              </Button>
            ) : null}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-3">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <InteractionStatus status={row.status} />
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <span className="tabular-nums">{row.createdAtLabel}</span>
            <ReadinessChip readinessScore={row.readinessScore} />
          </p>
          <CopyIdButton id={row.id} />
        </div>
      </section>

      {row.status === 'analysis_blocked' ? (
        <Alert tone="danger" className="rounded-sm">
          Sensitive material detected. This transcript was not sent to the model.
        </Alert>
      ) : null}
    </>
  );
}
