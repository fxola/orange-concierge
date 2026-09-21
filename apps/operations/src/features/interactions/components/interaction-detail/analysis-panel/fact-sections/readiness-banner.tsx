import type { EvidenceCoverage, ReadinessScore } from '@orange-concierge/core';
import { Alert, Badge } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { readinessLabel, readinessTone } from '../../../../view-models/readiness-presentation';

export function ReadinessBanner({
  readinessScore,
  coverage,
}: Readonly<{ readinessScore?: ReadinessScore; coverage: EvidenceCoverage }>) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-sm border border-border bg-surface px-4 py-3">
        <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
          Readiness
        </Text>
        {readinessScore ? (
          <>
            <p className="font-display text-2xl font-medium leading-7">
              {readinessScore.overall.score}
              <span className="text-base text-muted-foreground">/100</span>
            </p>
            <Badge tone={readinessTone(readinessScore.overall.level)}>
              {readinessLabel(readinessScore.overall.level)}
            </Badge>
          </>
        ) : (
          <Text className="text-sm text-muted-foreground">Not scored yet.</Text>
        )}
        <span className="text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground tabular-nums">
            {coverage.sourced}/{coverage.total}
          </strong>{' '}
          facts covered by transcript proof or consultant confirmation
        </span>
      </div>

      {coverage.isLowConfidence ? (
        <Alert tone="warning" className="rounded-sm">
          Low evidence coverage ({coverage.sourced}/{coverage.total}). Confirm the unsourced facts
          against the transcript. Recommendations are blocked until coverage improves.
        </Alert>
      ) : null}
    </>
  );
}
