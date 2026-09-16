import type { ReadinessScore } from '@orange-concierge/core';
import { FileSearch } from 'lucide-react';
import { Text } from '@/components/ui/text';
import { ReadinessScoreCard } from './readiness-score-card';

export function EmptyFacts() {
  return (
    <div className="grid justify-items-center gap-2 rounded-sm border border-dashed border-border px-4 py-6 text-center">
      <FileSearch aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
      <Text variant="small" tone="muted">
        No structured facts were extracted from this transcript.
      </Text>
    </div>
  );
}

export function AssessmentSummary({
  readinessScore,
}: Readonly<{ total: number; sourced: number; readinessScore?: ReadinessScore }>) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
      <div className="min-w-0 max-w-4xl">
        <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
          Extracted assessment
        </Text>
        <Text variant="h3" className="mt-1 font-display text-xl font-medium leading-7">
          Facts extracted from the transcript
        </Text>
        <Text variant="body" className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
          Each row is a claim from the transcript. Click any row to inspect the exact highlighted
          quote.
        </Text>
      </div>
      <ReadinessScoreCard score={readinessScore} />
    </div>
  );
}
