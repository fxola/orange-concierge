import { BookOpen, Quote } from 'lucide-react';
import type { GroundedRecommendation } from '@orange-concierge/core';

export function EvidenceList({
  recommendation,
}: Readonly<{ recommendation: GroundedRecommendation }>) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-warning">
        <Quote aria-hidden="true" className="h-3.5 w-3.5" />
        Client evidence
      </div>
      <div className="grid gap-2">
        {recommendation.clientEvidence.map((evidence) => (
          <figure
            key={`${recommendation.title}-${evidence.factPath}`}
            className="rounded-sm border border-warning/30 bg-warning-surface px-3 py-2.5"
          >
            <figcaption className="text-[11px] font-semibold text-warning">
              {evidence.factPath}
            </figcaption>
            <blockquote className="mt-1 font-display text-sm leading-6 text-foreground">
              "{evidence.quote}"
            </blockquote>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function KnowledgeList({
  recommendation,
}: Readonly<{ recommendation: GroundedRecommendation }>) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-info">
        <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
        Knowledge citations
      </div>
      <div className="grid gap-2">
        {recommendation.knowledgeCitations.map((citation) => (
          <article
            key={`${recommendation.title}-${citation.chunkId}`}
            className="rounded-sm border border-info/30 bg-info-surface px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold leading-5 text-foreground">
                {citation.sourceTitle}
              </p>
              <span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-semibold text-info tabular-nums">
                {Math.round(citation.score * 100)}% match
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {citation.heading ? `${citation.heading} · ` : ''}
              {citation.sourcePath}
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/85">
              {citation.content}
            </p>
            <p className="mt-2 font-mono text-[11px] leading-4 text-subtle-foreground">
              {citation.chunkId}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
