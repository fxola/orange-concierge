import type { EvidenceReference, ExtractedFacts, KnowledgeSearchHit } from '@orange-concierge/core';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';

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
  'interaction_facts_verified',
  'recommendation_reviewed',
  'recommendation_edited',
]);

export const auditResourceType = pgEnum('audit_resource_type', [
  'client',
  'interaction',
  'recommendation',
]);

export const recommendationStatus = pgEnum('recommendation_status', [
  'draft',
  'superseded',
  'pending_review',
  'approved',
  'rejected',
]);

export const recommendationPriority = pgEnum('recommendation_priority', ['low', 'medium', 'high']);

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
  extractedFacts: jsonb('extracted_facts').$type<ExtractedFacts>(),
  verifiedFactPaths: jsonb('verified_fact_paths').$type<string[]>(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull(),
});

export const recommendations = pgTable('recommendations', {
  id: text('id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => clients.id),
  interactionId: text('interaction_id')
    .notNull()
    .references(() => interactions.id),
  status: recommendationStatus('status').notNull(),
  title: text('title').notNull(),
  rationale: text('rationale').notNull(),
  summary: text('summary'),
  priority: recommendationPriority('priority'),
  clientEvidence: jsonb('client_evidence').$type<EvidenceReference[]>(),
  knowledgeCitations: jsonb('knowledge_citations').$type<KnowledgeSearchHit[]>(),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  }).notNull(),
  supersededAt: timestamp('superseded_at', {
    mode: 'date',
    withTimezone: true,
  }),
  reviewerId: text('reviewer_id'),
  reviewedAt: timestamp('reviewed_at', {
    mode: 'date',
    withTimezone: true,
  }),
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

export const KNOWLEDGE_EMBEDDING_DIMENSIONS = 768;

export const knowledgeSources = pgTable('knowledge_sources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  path: text('path').notNull().unique(),
  contentHash: text('content_hash').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).notNull(),
});

export const knowledgeChunks = pgTable(
  'knowledge_chunks',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id')
      .notNull()
      .references(() => knowledgeSources.id, { onDelete: 'cascade' }),
    sourceTitle: text('source_title').notNull(),
    sourcePath: text('source_path').notNull(),
    heading: text('heading'),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),
    embedding: vector('embedding', { dimensions: KNOWLEDGE_EMBEDDING_DIMENSIONS }).notNull(),
    embeddingModel: text('embedding_model').notNull(),
    embeddingDimensions: integer('embedding_dimensions').notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).notNull(),
  },
  (table) => [
    index('knowledge_chunks_source_id_idx').on(table.sourceId),
    uniqueIndex('knowledge_chunks_source_chunk_unique').on(table.sourceId, table.chunkIndex),
  ]
);

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: actorRole('role').default('consultant').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    issuer: text('issuer').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('account_userId_idx').on(table.userId),
    uniqueIndex('account_issuer_account_id_unique').on(table.issuer, table.accountId),
  ]
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)]
);
