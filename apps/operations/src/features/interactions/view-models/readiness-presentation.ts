import type { ReadinessLevel, ReadinessScoreBand } from '@orange-concierge/core';

export type ReadinessTone = 'success' | 'warning' | 'danger';

export function readinessLabel(level: ReadinessLevel): string {
  if (level === 'ready') {
    return 'Ready';
  }

  if (level === 'developing') {
    return 'Developing';
  }

  return 'Needs attention';
}

export function readinessTone(level: ReadinessLevel): ReadinessTone {
  if (level === 'ready') {
    return 'success';
  }

  if (level === 'developing') {
    return 'warning';
  }

  return 'danger';
}

export function readinessTranslation(level: ReadinessLevel): string {
  if (level === 'ready') {
    return 'Ready to draft recommendations after human review.';
  }

  if (level === 'developing') {
    return 'Continue review before relying on recommendations.';
  }

  return 'Pause recommendations until risks are reviewed.';
}

export function readinessScoreLabel(score: number): string {
  return `${score}/100`;
}

export function readinessCue(readiness: ReadinessScoreBand): string {
  return `${readinessLabel(readiness.level)} · ${readinessScoreLabel(readiness.score)}`;
}
