import type { InteractionRow } from '@/features/interactions/view-models/interactions';

export type InteractionCounts = Readonly<{
  received: number;
  completed: number;
  blocked: number;
}>;

export function countInteractionRows(rows: readonly InteractionRow[]): InteractionCounts {
  return rows.reduce(
    (counts, row) => ({
      received: counts.received + (row.status === 'received' ? 1 : 0),
      completed: counts.completed + (row.status === 'analysis_completed' ? 1 : 0),
      blocked: counts.blocked + (row.status === 'analysis_blocked' ? 1 : 0),
    }),
    { received: 0, completed: 0, blocked: 0 }
  );
}
