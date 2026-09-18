import {
  ListAuditEvents,
  type Actor,
  type AuditEvent,
  type ListAuditEventsResult,
} from '../../../src';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';

export type { ListAuditEventsResult };

const submittedAt = new Date('2026-09-16T09:00:00.000Z');
const reviewedAt = new Date('2026-09-16T10:00:00.000Z');
const editedAt = new Date('2026-09-16T11:00:00.000Z');

const reviewer: Actor = { id: 'reviewer-1', role: 'reviewer' };
const admin: Actor = { id: 'admin-1', role: 'admin' };
const consultant: Actor = { id: 'consultant-1', role: 'consultant' };

const clientId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const interactionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const recommendationId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function seedEvents(): AuditEvent[] {
  return [
    {
      actor: consultant,
      action: 'interaction_submitted',
      resource: { type: 'interaction', id: interactionId },
      occurredAt: submittedAt,
      metadata: { clientId },
    },
    {
      actor: reviewer,
      action: 'recommendation_reviewed',
      resource: { type: 'recommendation', id: recommendationId },
      occurredAt: reviewedAt,
      metadata: {
        previousStatus: 'pending_review',
        newStatus: 'approved',
        interactionId,
        clientId,
      },
    },
    {
      actor: consultant,
      action: 'recommendation_edited',
      resource: { type: 'recommendation', id: recommendationId },
      occurredAt: editedAt,
      metadata: { interactionId, clientId, changedFields: 'title' },
    },
  ];
}

export function listAuditEventsWorld() {
  const audit = new RecordingAudit();
  const listAuditEvents = new ListAuditEvents({ audit });

  return {
    givenAuditEvents() {
      audit.events.length = 0;
      audit.events.push(...seedEvents());
    },

    listAuditEvents() {
      return listAuditEvents;
    },

    audit() {
      return audit;
    },

    reviewer() {
      return reviewer;
    },

    admin() {
      return admin;
    },

    consultant() {
      return consultant;
    },
  };
}
