import type { GroundedRecommendation } from '@orange-concierge/core';
import { Badge } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { EvidenceList, KnowledgeList } from './recommendation-citations';
import { PRIORITY_LABELS, priorityTone } from './recommendation-priority';

export function RecommendationCard({
  recommendation,
  index,
}: Readonly<{ recommendation: GroundedRecommendation; index: number }>) {
  return (
    <article className="overflow-hidden rounded-md border border-border bg-surface-raised shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4">
        <div className="min-w-0">
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            Recommendation {index + 1}
          </Text>
          <h4 className="mt-1 font-display text-xl font-medium leading-7 text-foreground">
            {recommendation.title}
          </h4>
        </div>
        <Badge tone={priorityTone(recommendation.priority)}>
          {PRIORITY_LABELS[recommendation.priority]}
        </Badge>
      </div>

      <div className="grid gap-4 px-4 py-4">
        <p className="max-w-3xl text-sm leading-6 text-foreground/90">
          {recommendation.summary}
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <EvidenceList recommendation={recommendation} />
          <KnowledgeList recommendation={recommendation} />
        </div>
      </div>
    </article>
  );
}
