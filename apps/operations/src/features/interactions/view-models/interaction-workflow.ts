import { calculateEvidenceCoverage } from '@orange-concierge/core';
import type { InteractionRow } from './interactions';
import type { RecommendationsViewModel } from './recommendations';

export type InteractionDetailTabKey = 'summary' | 'transcript' | 'analysis' | 'recommendations';

export type NextStep = Readonly<{
  title: string;
  description: string;
  actionLabel?: string;
  targetTab?: InteractionDetailTabKey;
}>;

export type StepState = 'done' | 'current' | 'upcoming' | 'error';

export type WorkflowStep = Readonly<{ label: string; state: StepState }>;

export function getNextStep(
  row: InteractionRow,
  recommendationsVm: RecommendationsViewModel
): NextStep {
  if (row.status === 'received') {
    return {
      title: 'Analyze transcript',
      description:
        'This interaction needs analysis. Run Analyze interaction to extract structured facts, or review the transcript first.',
      actionLabel: 'View transcript',
      targetTab: 'transcript',
    };
  }

  if (row.status === 'analysis_blocked') {
    return {
      title: 'Fix blocked transcript',
      description:
        'Sensitive material detected. This transcript was not sent to the model. Remove prohibited secret material, then resubmit safe notes.',
    };
  }

  const facts = row.extractedFacts ?? {};
  const coverage = calculateEvidenceCoverage(facts, row.verifiedFactPaths);
  const sourcedCount = coverage.sourced;

  if (coverage.total === 0) {
    return {
      title: 'Review extracted facts',
      description:
        'Analysis completed but no structured facts were extracted. Review the transcript and analysis before generating recommendations.',
      actionLabel: 'View analysis',
      targetTab: 'analysis',
    };
  }

  if (coverage.isLowConfidence) {
    return {
      title: 'Fix low evidence coverage',
      description: `Only ${sourcedCount}/${coverage.total} facts have transcript proof. Confirm unsourced facts against the transcript before generating recommendations.`,
      actionLabel: 'View analysis',
      targetTab: 'analysis',
    };
  }

  if (recommendationsVm.status === 'empty') {
    return {
      title: 'Generate recommendations',
      description:
        'Facts look grounded. Generate recommendations from transcript evidence and indexed guidance.',
      actionLabel: 'View recommendations',
      targetTab: 'recommendations',
    };
  }

  if (recommendationsVm.status === 'unavailable') {
    return {
      title: 'Review recommendations',
      description: 'Recommendations could not be loaded. Refresh the page to retry.',
    };
  }

  const recommendations =
    recommendationsVm.status === 'ok' ? recommendationsVm.recommendations : [];
  const drafts = recommendations.filter((item) => item.status === 'draft').length;
  const pending = recommendations.filter((item) => item.status === 'pending_review').length;

  if (drafts > 0) {
    return {
      title: 'Edit recommendation before review',
      description: `${drafts} draft${drafts === 1 ? '' : 's'} need${drafts === 1 ? 's' : ''} review. Edit for accuracy, then submit for review.`,
      actionLabel: 'View recommendations',
      targetTab: 'recommendations',
    };
  }

  if (pending > 0) {
    return {
      title: 'Awaiting reviewer',
      description: `${pending} recommendation${pending === 1 ? '' : 's'} pending review.`,
      actionLabel: 'View recommendations',
      targetTab: 'recommendations',
    };
  }

  if (recommendations.length === 0) {
    return {
      title: 'Generate recommendations',
      description:
        'No active recommendations yet. Generate recommendations from transcript evidence and indexed guidance.',
      actionLabel: 'View recommendations',
      targetTab: 'recommendations',
    };
  }

  return {
    title: 'Review complete',
    description: 'All recommendations have been reviewed.',
    actionLabel: 'View recommendations',
    targetTab: 'recommendations',
  };
}

export function workflowSteps(
  row: InteractionRow,
  recommendationsVm: RecommendationsViewModel
): readonly WorkflowStep[] {
  if (row.status === 'received') {
    return [
      { label: 'Captured', state: 'done' },
      { label: 'Analyzed', state: 'current' },
      { label: 'Recommendations', state: 'upcoming' },
      { label: 'In review', state: 'upcoming' },
    ];
  }

  if (row.status === 'analysis_blocked') {
    return [
      { label: 'Captured', state: 'done' },
      { label: 'Analyzed', state: 'error' },
      { label: 'Recommendations', state: 'upcoming' },
      { label: 'In review', state: 'upcoming' },
    ];
  }

  const recommendations =
    recommendationsVm.status === 'ok' ? recommendationsVm.recommendations : [];
  const pending = recommendations.filter((item) => item.status === 'pending_review').length;
  const drafts = recommendations.filter((item) => item.status === 'draft').length;
  const reviewed = recommendations.filter(
    (item) => item.status === 'approved' || item.status === 'rejected'
  ).length;

  if (recommendations.length > 0 && drafts === 0 && pending === 0 && reviewed > 0) {
    return [
      { label: 'Captured', state: 'done' },
      { label: 'Analyzed', state: 'done' },
      { label: 'Recommendations', state: 'done' },
      { label: 'In review', state: 'done' },
    ];
  }

  return [
    { label: 'Captured', state: 'done' },
    { label: 'Analyzed', state: 'done' },
    {
      label: 'Recommendations',
      state: recommendations.length > 0 ? 'done' : 'current',
    },
    { label: 'In review', state: recommendations.length > 0 ? 'current' : 'upcoming' },
  ];
}
