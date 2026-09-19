'use client';

import { useState } from 'react';
import type { InteractionDetailTabKey } from '../../view-models/interaction-workflow';
import type { InteractionRow } from '../../view-models/interactions';
import type { RecommendationsViewModel } from '../../view-models/recommendations';
import { AnalysisPanel } from './analysis-panel';
import { SummaryPanel } from './summary-panel';
import { TranscriptPanel } from './transcript-panel';
import { RecommendationsPanel } from './recommendations-panel';
import { InteractionHeader } from './interaction-header';

type DetailTab = Readonly<{
  key: InteractionDetailTabKey;
  label: string;
}>;

const BASE_TABS: readonly DetailTab[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'transcript', label: 'Transcript' },
  { key: 'analysis', label: 'Analysis' },
];

const RECOMMENDATIONS_TAB: DetailTab = {
  key: 'recommendations',
  label: 'Recommendations',
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
  canVerifyFacts,
}: Readonly<{
  activeTab: InteractionDetailTabKey;
  row: InteractionRow;
  recommendationsVm: RecommendationsViewModel;
  canVerifyFacts: boolean;
}>) {
  if (activeTab === 'summary') {
    return <SummaryPanel row={row} />;
  }

  if (activeTab === 'transcript') {
    return <TranscriptPanel transcript={row.transcript} />;
  }

  if (activeTab === 'analysis') {
    return <AnalysisPanel row={row} canVerifyFacts={canVerifyFacts} />;
  }

  return (
    <RecommendationsPanel
      interactionId={row.id}
      status={row.status}
      recommendationsVm={recommendationsVm}
      row={row}
    />
  );
}

export function InteractionDetailTabs({
  row,
  recommendationsVm,
  canVerifyFacts,
}: Readonly<{
  row: InteractionRow;
  recommendationsVm: RecommendationsViewModel;
  canVerifyFacts: boolean;
}>) {
  const tabs = tabsFor(row);
  const [activeTab, setActiveTab] = useState<InteractionDetailTabKey>('summary');

  return (
    <div className="mt-3 grid gap-4">
      <InteractionHeader
        row={row}
        recommendationsVm={recommendationsVm}
        onSelectTab={setActiveTab}
      />
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

        <section
          id={`interaction-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`interaction-tab-${activeTab}`}
          className="p-4 sm:p-5"
        >
          <ActivePanel
            activeTab={activeTab}
            row={row}
            recommendationsVm={recommendationsVm}
            canVerifyFacts={canVerifyFacts}
          />
        </section>
      </div>
    </div>
  );
}
