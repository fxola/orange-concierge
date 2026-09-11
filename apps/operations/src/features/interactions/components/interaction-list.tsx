import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TableEmpty } from '@/components/ui/page';
import { Text } from '@/components/ui/text';
import type { InteractionRow } from '../view-models/interactions';
import { InteractionCard } from './interaction-card';

export function InteractionList({
  status,
  rows,
  totalRows,
  intakeOpen,
  onAddFirst,
  onClearFilters,
}: Readonly<{
  status: 'ok' | 'empty' | 'unavailable';
  rows: readonly InteractionRow[];
  totalRows: number;
  intakeOpen: boolean;
  onAddFirst: () => void;
  onClearFilters: () => void;
}>) {
  return (
    <div className="grid gap-3">
      {status === 'unavailable' ? (
        <div className="rounded-sm border border-border bg-surface px-5 py-10 text-center sm:px-6">
          <Text tone="muted" variant="small">
            Interactions are unreachable right now. Nothing was lost.
          </Text>
        </div>
      ) : null}

      {status === 'empty' && !intakeOpen ? (
        <div className="overflow-hidden rounded-sm border border-border bg-surface">
          <TableEmpty
            title="No interactions yet"
            description="Start with meeting notes. Analysis and review will appear here."
            action={
              <Button size="sm" onClick={onAddFirst}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add first interaction
              </Button>
            }
          />
        </div>
      ) : null}

      {(status === 'ok' || (status === 'empty' && intakeOpen)) &&
      rows.length === 0 &&
      totalRows > 0 ? (
        <div className="grid justify-items-center gap-2 rounded-sm border border-border bg-surface px-5 py-10 text-center sm:px-6">
          <Text variant="label">No matches</Text>
          <Text variant="small" tone="muted">
            Try a different search, or clear the status filter.
          </Text>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear search and filters
          </Button>
        </div>
      ) : null}

      {rows.map((row) => (
        <InteractionCard key={row.id} row={row} />
      ))}
    </div>
  );
}
