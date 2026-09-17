import type { GroundedRecommendation, Recommendation } from '@orange-concierge/core';

type CardRecommendation = Recommendation | GroundedRecommendation;

export function RecommendationProof({
  recommendation,
}: Readonly<{ recommendation: CardRecommendation }>) {
  const evidence = recommendation.clientEvidence ?? [];
  const citations = recommendation.knowledgeCitations ?? [];
  const summary = `${evidence.length} ${evidence.length === 1 ? 'quote' : 'quotes'} • ${citations.length} ${citations.length === 1 ? 'guide' : 'guides'}`;

  return (
    <details className="group rounded-sm border border-border bg-background/40 px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="tabular-nums">{summary}</span>
        <span className="text-xs font-semibold text-muted-foreground group-open:hidden">
          Show details
        </span>
        <span className="hidden text-xs font-semibold text-muted-foreground group-open:inline">
          Hide
        </span>
      </summary>
      <div className="grid gap-3 pb-1 pt-3">
        <div className="grid gap-2">
          {evidence.map((item) => (
            <blockquote
              key={`${recommendation.title}-${item.factPath}`}
              title={`Source: ${item.factPath}`}
              className="cursor-help border-l-2 border-border px-3 text-sm leading-6 text-muted-foreground"
            >
              “{item.quote}”
            </blockquote>
          ))}
        </div>
        <div className="grid gap-1">
          {citations.map((citation) => (
            <div
              key={`${recommendation.title}-${citation.chunkId}`}
              title={`Source: ${citation.sourcePath} • ${citation.chunkId}`}
              className="flex cursor-help items-baseline justify-between gap-3"
            >
              <p className="min-w-0 truncate text-xs leading-5 text-muted-foreground">
                {citation.sourceTitle}
                {citation.heading ? ` — ${citation.heading}` : ''}
              </p>
              <span className="shrink-0 text-[11px] font-semibold text-muted-foreground tabular-nums">
                {Math.round(citation.score * 100)}% match
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
