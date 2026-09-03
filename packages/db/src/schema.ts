import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export type AuditMetadataJson = Readonly<Record<string, string | number | boolean | null>>;

export const actorRole = pgEnum('actor_role', ['admin', 'consultant', 'reviewer']);

export const interactionStatus = pgEnum('interaction_status', [
  'received',
  'analysis_blocked',
  'analysis_completed',
]);

export const auditAction = pgEnum('audit_action', [
  'interaction_submitted',
  'interaction_scan_passed',
  'interaction_scan_blocked',
  'interaction_analysis_completed',
  'interaction_analysis_failed',
  'recommendation_reviewed',
]);

export const auditResourceType = pgEnum('audit_resource_type', [
  'client',
  'interaction',
  'recommendation',
]);

export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull(),
});

export const interactions = pgTable('interactions', {
  id: text('id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  submittedBy: text('submitted_by').notNull(),
  status: interactionStatus('status').notNull(),
  transcript: text('transcript').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull(),
});

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: text('actor_id').notNull(),
  actorRole: actorRole('actor_role').notNull(),
  action: auditAction('action').notNull(),
  resourceType: auditResourceType('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  occurredAt: timestamp('occurred_at', { mode: 'date', withTimezone: true }).notNull(),
  metadata: jsonb('metadata').$type<AuditMetadataJson | null>(),
});
