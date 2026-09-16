import type { RecommendationPriority } from '@orange-concierge/core';

export const PRIORITY_LABELS: Record<RecommendationPriority, string> = {
  low: 'Low priority',
  medium: 'Medium priority',
  high: 'High priority',
};

export function priorityTone(priority: RecommendationPriority): 'info' | 'warning' | 'danger' {
  if (priority === 'high') {
    return 'danger';
  }

  if (priority === 'medium') {
    return 'warning';
  }

  return 'info';
}
