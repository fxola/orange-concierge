import type { Actor } from '../domain/actor';

export type AuditAction =
  | 'interaction_submitted'
  | 'interaction_scan_passed'
  | 'interaction_scan_blocked'
  | 'interaction_analysis_completed'
  | 'interaction_analysis_failed'
  | 'recommendation_reviewed'
  | 'recommendation_edited';

export type AuditResourceType = 'client' | 'interaction' | 'recommendation';

export type AuditResource = Readonly<{
  type: AuditResourceType;
  id: string;
}>;

export type AuditMetadataValue = string | number | boolean | null;

export type AuditMetadata = Readonly<Record<string, AuditMetadataValue>>;

export type AuditEvent = Readonly<{
  actor: Actor;
  action: AuditAction;
  resource: AuditResource;
  occurredAt: Date;
  metadata?: AuditMetadata;
}>;

export interface AuditPort {
  record(event: AuditEvent): Promise<void>;
}
