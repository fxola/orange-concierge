import type { Actor } from '../domain/actor';
import { AuditAction, AuditEventFilter, AuditEventPage, AuditResourceType } from '../domain/audit';

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
  list(filter: AuditEventFilter): Promise<AuditEventPage>;
}
