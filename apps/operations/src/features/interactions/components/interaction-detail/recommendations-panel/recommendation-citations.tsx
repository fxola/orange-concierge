'use client';

import { useId, useState } from 'react';
import type { GroundedRecommendation, Recommendation } from '@orange-concierge/core';

type CardRecommendation = Recommendation | GroundedRecommendation;

export function RecommendationProof({
  recommendation,
}: Readonly<{ recommendation: CardRecommendation }>) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const evidence = recommendation.clientEvidence ?? [];
  const citations = recommendation.knowledgeCitations ?? [];
  const summary = `${evidence.length} ${evidence.length === 1 ? 'quote' : 'quotes'} • ${citations.length} ${citations.length === 1 ? 'guide' : 'guides'}`;

  return (
    <div className="rounded-sm border border-border bg-background/40 px-3 py-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${open ? 'Hide' : 'Show'} proof for ${recommendation.title}`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="tabular-nums">{summary}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {open ? 'Hide' : 'Show details'}
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label={`Proof for ${recommendation.title}`}
          className="grid min-w-0 gap-3 pb-1 pt-3"
        >
        <div className="grid min-w-0 gap-2">
          {evidence.map((item) => (
            <blockquote
              key={`${recommendation.title}-${item.factPath}`}
              title={`Source: ${item.factPath}`}
              className="min-w-0 cursor-help border-l-2 border-border px-3 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]"
            >
              “{item.quote}”
            </blockquote>
          ))}
        </div>
        <div className="grid min-w-0 gap-1">
          {citations.map((citation) => (
            <div
              key={`${recommendation.title}-${citation.chunkId}`}
              title={`Source: ${citation.sourcePath} • ${citation.chunkId}`}
              className="flex min-w-0 cursor-help items-baseline justify-between gap-3"
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
      ) : null}
    </div>
  );
}
