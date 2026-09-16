'use client';

import { useState } from 'react';
import { Text } from '@/components/ui/text';
import type { InteractionRow } from '../../view-models/interactions';
import type { RecommendationsViewModel } from '../../view-models/recommendations';
import { AnalysisPanel } from './analysis-panel';
import { SummaryPanel } from './summary-panel';
import { TranscriptPanel } from './transcript-panel';
import { RecommendationsPanel } from './recommendations-panel';

type TabKey = 'summary' | 'transcript' | 'analysis' | 'recommendations';

type DetailTab = Readonly<{
  key: TabKey;
  label: string;
  description: string;
}>;

const BASE_TABS: readonly DetailTab[] = [
  {
    key: 'summary',
    label: 'Summary',
    description: 'A quick operational brief for this interaction.',
  },
  {
    key: 'transcript',
    label: 'Transcript',
    description: 'Full meeting notes for this interaction.',
  },
  {
    key: 'analysis',
    label: 'Analysis',
    description: 'Extracted facts, readiness, and transcript evidence.',
  },
];

const RECOMMENDATIONS_TAB: DetailTab = {
  key: 'recommendations',
  label: 'Recommendations',
  description: 'Grounded drafts with transcript evidence and internal guidance citations.',
};

function tabsFor(row: InteractionRow): readonly DetailTab[] {
  if (row.status === 'analysis_completed') {
    return [...BASE_TABS, RECOMMENDATIONS_TAB];
  }

  return BASE_TABS;
}

function ActivePanel({
  activeTab,
  row,
  recommendationsVm,
}: Readonly<{ activeTab: TabKey; row: InteractionRow; recommendationsVm: RecommendationsViewModel }>) {
  if (activeTab === 'summary') {
    return <SummaryPanel row={row} />;
  }

  if (activeTab === 'transcript') {
    return <TranscriptPanel transcript={row.transcript} />;
  }

  if (activeTab === 'analysis') {
    return <AnalysisPanel row={row} />;
  }

  return (
    <RecommendationsPanel
      interactionId={row.id}
      status={row.status}
      recommendationsVm={recommendationsVm}
    />
  );
}

export function InteractionDetailTabs({
  row,
  recommendationsVm,
}: Readonly<{ row: InteractionRow; recommendationsVm: RecommendationsViewModel }>) {
  const tabs = tabsFor(row);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const activeTabMeta = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <div className="mt-5 grid gap-4">
      <div className="overflow-hidden rounded-sm border border-border bg-surface shadow-xs">
        <div
          role="tablist"
          aria-label="Interaction detail sections"
          className="flex gap-1 overflow-x-auto border-b border-border bg-background/55 p-1"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                id={`interaction-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`interaction-panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'shrink-0 rounded-sm px-4 py-2 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150 ease-cubic focus-visible:outline-none',
                  isActive
                    ? 'bg-surface text-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="border-b border-border px-5 py-4 sm:px-6">
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            {activeTabMeta?.label}
          </Text>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {activeTabMeta?.description}
          </p>
        </div>

        <section
          id={`interaction-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`interaction-tab-${activeTab}`}
          className="p-4 sm:p-5"
        >
          <ActivePanel activeTab={activeTab} row={row} recommendationsVm={recommendationsVm} />
        </section>
      </div>
    </div>
  );
}
