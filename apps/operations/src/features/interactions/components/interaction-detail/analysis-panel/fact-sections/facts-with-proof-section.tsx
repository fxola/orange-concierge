import { BadgeCheck } from 'lucide-react';
import type { FactItem } from '../../../../view-models/analysis-facts';
import { GROUP_META } from '../group-meta';
import { ExtractedFactValue } from './extracted-fact-value';
import { isExactTranscriptMatch } from './transcript-match';
import { Text } from '@/components/ui/text';

export function FactsWithProofSection({
  items,
  totalCount,
}: Readonly<{ items: readonly FactItem[]; totalCount: number }>) {
  return (
    <section
      aria-label="Facts with transcript proof"
      className="overflow-hidden rounded-sm border border-success/40 bg-surface shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <Text
          variant="h3"
          className="inline-flex items-center gap-2 font-display text-lg font-medium"
        >
          <BadgeCheck aria-hidden="true" className="h-4 w-4 text-success" />
          Facts with transcript proof
        </Text>
        <span className="rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-success">
          {items.length}/{totalCount}
        </span>
      </div>
      {items.length === 0 ? (
        <Text className="px-4 py-4 text-sm leading-6 text-muted-foreground">
          Nothing carries transcript proof yet. Confirm items below to build coverage.
        </Text>
      ) : (
        <div className="divide-y divide-border/70">
          {items.map((item) => {
            const { value, evidence } = item;
            const exactMatch = evidence ? isExactTranscriptMatch(value, evidence.quote) : false;
            return (
              <div key={item.path} className="grid gap-3 px-4 py-3.5">
                <Text className="text-xs font-medium text-muted-foreground">
                  {GROUP_META[item.group].title} · {item.label}
                </Text>
                <ExtractedFactValue value={item.value} />
                {item.evidence ? (
                  exactMatch ? (
                    <Text className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-success">
                      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                      Exact transcript match — quote is identical to the extracted fact
                    </Text>
                  ) : (
                    <div className="grid gap-1">
                      <Text className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Transcript proof
                      </Text>
                      <blockquote className="min-w-0 border-l-2 border-success px-3 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
                        “{item.evidence.quote}”
                      </blockquote>
                    </div>
                  )
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
