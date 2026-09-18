import 'server-only';

import type {
  AuditAction,
  AuditEvent,
  AuditMetadataValue,
  ListAuditEventsResult,
} from '@orange-concierge/core';

import { shortId } from '@/lib/short-id';

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  interaction_submitted: 'Interaction submitted',
  interaction_scan_passed: 'Security scan passed',
  interaction_scan_blocked: 'Security scan blocked',
  interaction_analysis_completed: 'Analysis completed',
  interaction_analysis_failed: 'Analysis failed',
  recommendation_reviewed: 'Recommendation reviewed',
  recommendation_edited: 'Recommendation draft edited',
};

const METADATA_LABELS: Readonly<Record<string, string>> = {
  previousStatus: 'Previous status',
  newStatus: 'New status',
  changedFields: 'Changed fields',
  findingCount: 'Findings',
  failureSource: 'Failure source',
  failureReason: 'Failure reason',
};

export type AuditTrailDetail = Readonly<{ label: string; value: string }>;

export type AuditTrailRow = Readonly<{
  key: string;
  action: AuditAction;
  actionLabel: string;
  actorLabel: string;
  actorRole: string;
  occurredAtLabel: string;
  resourceLabel: string;
  resourceHref: string | null;
  details: readonly AuditTrailDetail[];
}>;

export type AuditTrailViewModel =
  | Readonly<{
      status: 'ok';
      rows: readonly AuditTrailRow[];
      page: number;
      totalPages: number;
      total: number;
      action?: AuditAction;
      emptyCopy: string;
    }>
  | Readonly<{ status: 'unavailable' }>
  | Readonly<{ status: 'forbidden' }>;

function formatDateTimeLabel(date: Date): string {
  return date.toISOString().slice(0, 16).replace('T', ' ');
}

function toDetails(metadata: AuditEvent['metadata']): readonly AuditTrailDetail[] {
  if (!metadata) {
    return [];
  }
  const details: AuditTrailDetail[] = [];
  for (const key of Object.keys(METADATA_LABELS)) {
    const value: AuditMetadataValue | undefined = metadata[key];
    if (value === undefined || value === null) {
      continue;
    }
    details.push({ label: METADATA_LABELS[key], value: String(value) });
  }
  return details;
}

function toResourceLink(event: AuditEvent): string | null {
  const metadata = event.metadata;
  const clientId = metadata?.clientId;
  if (event.resource.type === 'client') {
    return `/clients/${event.resource.id}`;
  }
  if (typeof clientId !== 'string' || clientId.length === 0) {
    return null;
  }
  if (event.resource.type === 'interaction') {
    return `/clients/${clientId}/interactions/${event.resource.id}`;
  }
  const interactionId = metadata?.interactionId;
  if (typeof interactionId === 'string' && interactionId.length > 0) {
    return `/clients/${clientId}/interactions/${interactionId}`;
  }
  return null;
}

function toRow(event: AuditEvent): AuditTrailRow {
  return {
    key: `${event.resource.type}-${event.resource.id}-${event.action}-${event.occurredAt.toISOString()}`,
    action: event.action,
    actionLabel: AUDIT_ACTION_LABELS[event.action],
    actorLabel: event.actor.id,
    actorRole: event.actor.role,
    occurredAtLabel: formatDateTimeLabel(event.occurredAt),
    resourceLabel: `${event.resource.type} ${shortId(event.resource.id)}`,
    resourceHref: toResourceLink(event),
    details: toDetails(event.metadata),
  };
}

export function toAuditTrailViewModel(
  result: ListAuditEventsResult,
  options: Readonly<{ page: number; limit: number; action?: AuditAction }>
): AuditTrailViewModel {
  if (result.isFailure()) {
    if (result.getError().code === 'unauthorized_audit_view') {
      return { status: 'forbidden' };
    }
    return { status: 'unavailable' };
  }

  const page = result.getValue();

  const emptyCopy = options.action
    ? 'No events match this filter.'
    : options.page > 1
      ? 'No more events on this page.'
      : 'Actions taken in the app will appear here.';

  return {
    status: 'ok',
    rows: page.events.map(toRow),
    page: options.page,
    totalPages: Math.max(1, Math.ceil(page.total / options.limit)),
    total: page.total,
    action: options.action,
    emptyCopy,
  };
}
