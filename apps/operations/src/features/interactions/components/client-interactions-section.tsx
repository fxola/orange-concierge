'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { countInteractionRows } from '@/lib/interaction-counts';
import type { ClientInteractionsViewModel } from '../view-models/interactions';
import { ClientOption } from '../view-models/submit-interaction';
import { InteractionFilterTabs, type InteractionFilterTab } from './interaction-filter-tabs';
import { InteractionList } from './interaction-list';
import { InteractionSearch } from './interaction-search';
import { SubmitInteractionForm } from './submit-interaction-form';

export function ClientInteractionsSection({
  client,
  interactions,
}: {
  client: ClientOption;
  interactions: ClientInteractionsViewModel;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<InteractionFilterTab>('all');
  const [query, setQuery] = useState('');
  const rows = interactions.status === 'ok' ? interactions.rows : [];
  const counts = countInteractionRows(rows);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (tab === 'received' && row.status !== 'received') {
        return false;
      }
      if (tab === 'completed' && row.status !== 'analysis_completed') {
        return false;
      }
      if (tab === 'blocked' && row.status !== 'analysis_blocked') {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return row.transcript.toLowerCase().includes(needle) || row.id.toLowerCase().includes(needle);
    });
  }, [rows, tab, query]);

  return (
    <section className="grid min-w-0 gap-4">
      <div className="overflow-hidden rounded-sm border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">Interactions</h2>
            <span className="text-sm text-muted-foreground tabular-nums">{rows.length}</span>
          </div>
          <Button size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? (
              <Minus aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Plus aria-hidden="true" className="h-4 w-4" />
            )}

            {open ? 'Close intake' : 'Add interaction'}
          </Button>
        </div>

        <InteractionFilterTabs
          active={tab}
          counts={{ ...counts, total: rows.length }}
          onChange={setTab}
        />

        <InteractionSearch
          value={query}
          shown={filtered.length}
          total={rows.length}
          onChange={setQuery}
        />
      </div>

      {open ? <SubmitInteractionForm clients={[]} fixedClient={client} /> : null}

      <InteractionList
        status={interactions.status}
        rows={filtered}
        totalRows={rows.length}
        intakeOpen={open}
        onAddFirst={() => setOpen(true)}
        onClearFilters={() => {
          setQuery('');
          setTab('all');
        }}
      />
    </section>
  );
}
