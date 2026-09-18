import type { AuditAction } from '@orange-concierge/core';

const ACTION_DOT_CLASSES: Record<AuditAction, string> = {
  interaction_submitted: 'bg-subtle-foreground',
  interaction_scan_passed: 'bg-info',
  interaction_scan_blocked: 'bg-danger',
  interaction_analysis_completed: 'bg-success',
  interaction_analysis_failed: 'bg-danger',
  recommendation_reviewed: 'bg-success',
  recommendation_edited: 'bg-warning',
};

export function AuditActionDot({ action }: Readonly<{ action: AuditAction }>) {
  return (
    <span
      aria-hidden="true"
      className={`h-2 w-2 shrink-0 rounded-full ${ACTION_DOT_CLASSES[action]}`}
    />
  );
}
