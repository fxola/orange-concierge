import 'server-only';
import { getApplication } from '@orange-concierge/infrastructure';
import { isNextControlFlowError, requirePageActor } from '@/server/actor';
import {
  formatDateLabel,
  toClientListViewModel,
  type ClientListViewModel,
  type ClientRow,
} from '@/features/clients/view-models/clients';

const LIST_LIMIT = 20;

export async function getClients(): Promise<ClientListViewModel> {
  try {
    const actor = await requirePageActor();
    const app = getApplication();
    const result = await app.clients.getAll({
      actor,
      limit: LIST_LIMIT,
      offset: 0,
    });

    const baseVm = toClientListViewModel(result);
    if (baseVm.status !== 'ok') {
      return baseVm;
    }

    const summariesResult = await app.clients.getReviewSummaries({
      actor,
      clientIds: baseVm.rows.map((row) => row.id),
    });

    if (summariesResult.isFailure()) {
      return { status: 'unavailable' };
    }

    const summaryByClientId = new Map(
      summariesResult.getValue().map((summary) => [summary.clientId, summary])
    );

    const enrichedRows = baseVm.rows.map((row): ClientRow => {
      const summary = summaryByClientId.get(row.id);
      if (!summary) {
        return row;
      }

      return {
        ...row,
        totalInteractions: summary.totalInteractions,
        needsAnalysis: summary.needsAnalysis,
        completed: summary.completed,
        blocked: summary.blocked,
        latestInteractionLabel: summary.latestInteractionAt
          ? formatDateLabel(summary.latestInteractionAt)
          : null,
      };
    });

    enrichedRows.sort((a, b) => {
      const needsDiff = (b.needsAnalysis ?? 0) - (a.needsAnalysis ?? 0);
      if (needsDiff !== 0) {
        return needsDiff;
      }

      const blockedDiff = (b.blocked ?? 0) - (a.blocked ?? 0);
      if (blockedDiff !== 0) {
        return blockedDiff;
      }

      return a.displayName.localeCompare(b.displayName);
    });

    return { status: 'ok', rows: enrichedRows };
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { status: 'unavailable' };
  }
}
