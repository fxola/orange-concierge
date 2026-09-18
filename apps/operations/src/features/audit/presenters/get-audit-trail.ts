import 'server-only';

import { getApplication } from '@orange-concierge/infrastructure';
import { auditActions, type AuditAction } from '@orange-concierge/core';

import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  toAuditTrailViewModel,
  type AuditTrailViewModel,
} from '@/features/audit/view-models/audit-trail';

const PAGE_LIMIT = 7;

function parseAction(raw: unknown): AuditAction | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  return (auditActions as readonly string[]).includes(raw) ? (raw as AuditAction) : undefined;
}

function parsePage(raw: unknown): number {
  const page = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export async function getAuditTrail(
  input: Readonly<{
    action?: unknown;
    page?: unknown;
  }>
): Promise<AuditTrailViewModel> {
  try {
    const actor = await requirePageActor();
    const action = parseAction(input.action);
    const page = parsePage(input.page);
    const result = await getApplication().audit.list({
      actor,
      action,
      limit: PAGE_LIMIT,
      offset: (page - 1) * PAGE_LIMIT,
    });

    return toAuditTrailViewModel(result, { page, limit: PAGE_LIMIT, action });
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { status: 'unavailable' };
  }
}
