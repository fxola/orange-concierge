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
const INTERACTIONS_PER_CLIENT_LIMIT = 20;

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

    const enrichedRows = await Promise.all(
      baseVm.rows.map(async (row): Promise<ClientRow> => {
        try {
          const interactionsResult = await app.interaction.list({
            actor,
            clientId: row.id,
            limit: INTERACTIONS_PER_CLIENT_LIMIT,
            offset: 0,
          });

          if (interactionsResult.isFailure()) {
            return row;
          }

          const interactions = interactionsResult.getValue();
          const needsAnalysis = interactions.filter((item) => item.status === 'received').length;
          const completed = interactions.filter(
            (item) => item.status === 'analysis_completed'
          ).length;
          const blocked = interactions.filter((item) => item.status === 'analysis_blocked').length;
          const latest = interactions[0]?.createdAt;

          return {
            ...row,
            totalInteractions: interactions.length,
            needsAnalysis,
            completed,
            blocked,
            latestInteractionLabel: latest ? formatDateLabel(latest) : null,
          };
        } catch {
          return row;
        }
      })
    );

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
