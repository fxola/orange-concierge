'use client';

import { useEffect, useState } from 'react';
import type { EvidenceReference, ExtractedFacts, ReadinessScore } from '@orange-concierge/core';
import { AssessmentSummary, EmptyFacts } from './assessment-summary';
import { EvidenceDialog } from './evidence-dialog';
import { FACT_GROUPS, collectFactItems, hasExtractedFacts, itemsForGroup } from './fact-model';
import { FactGroupCard } from './fact-group-card';

export function ExtractedFactsView({
  facts,
  transcript,
  readinessScore,
}: Readonly<{ facts: ExtractedFacts; transcript: string; readinessScore?: ReadinessScore }>) {
  const [activeEvidence, setActiveEvidence] = useState<EvidenceReference | null>(null);

  useEffect(() => {
    if (!activeEvidence) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveEvidence(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeEvidence]);

  if (!hasExtractedFacts(facts)) {
    return <EmptyFacts />;
  }

  const items = collectFactItems(facts);
  const sourcedCount = items.filter((item) => item.evidence).length;

  return (
    <div className="rounded-sm border border-border bg-surface p-4 sm:p-5">
      <AssessmentSummary
        total={items.length}
        sourced={sourcedCount}
        readinessScore={readinessScore}
      />

      <div className="mt-4 grid gap-4">
        {FACT_GROUPS.map((group) => (
          <FactGroupCard
            key={group}
            group={group}
            items={itemsForGroup(items, group)}
            onEvidenceOpen={setActiveEvidence}
          />
        ))}
      </div>

      {activeEvidence ? (
        <EvidenceDialog
          evidence={activeEvidence}
          transcript={transcript}
          onClose={() => setActiveEvidence(null)}
        />
      ) : null}
    </div>
  );
}
