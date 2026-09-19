'use client';

import { Check, X } from 'lucide-react';
import { MIN_EVIDENCE_QUOTE_LENGTH } from '@orange-concierge/core';
import type { Recommendation } from '@orange-concierge/core';

export type RecommendationCheck = Readonly<{
  label: string;
  pass: boolean;
  hint?: string;
}>;

const SCHEMA_KEY_TITLES = ['currentArrangement', 'assetsDiscussed', 'incidentHistory', 'nextSteps'];

function hasSchemaKeyTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return SCHEMA_KEY_TITLES.some((key) => lower.includes(key.toLowerCase()));
}

function significantWords(value: string): readonly string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4);
}

function contradictsEvidence(title: string, quotes: readonly string[]): boolean {
  if (!title.toLowerCase().includes('enable')) {
    return false;
  }

  const titleWords = new Set(significantWords(title));
  if (titleWords.size === 0) {
    return false;
  }

  return quotes.some((quote) => {
    if (!quote.toLowerCase().includes('disabled')) {
      return false;
    }
    return significantWords(quote).some((word) => titleWords.has(word));
  });
}

export function getRecommendationChecks(
  recommendation: Recommendation
): readonly RecommendationCheck[] {
  const evidence = recommendation.clientEvidence ?? [];
  const citations = recommendation.knowledgeCitations ?? [];
  const quotes = evidence.map((entry) => entry.quote);

  return [
    {
      label: `Cites transcript evidence (${evidence.length} ${evidence.length === 1 ? 'quote' : 'quotes'})`,
      pass: evidence.length > 0,
      hint: 'Regenerate after improving transcript evidence.',
    },
    {
      label: 'Evidence quotes have context',
      pass:
        evidence.length > 0 &&
        quotes.every((quote) => quote.trim().length >= MIN_EVIDENCE_QUOTE_LENGTH),
      hint: 'Short quotes were rejected at generation. Regenerate from better-sourced facts.',
    },
    {
      label: `Cites internal guidance (${citations.length} ${citations.length === 1 ? 'guide' : 'guides'})`,
      pass: citations.length > 0,
      hint: 'Regenerate after indexing relevant guidance.',
    },
    {
      label: 'Title uses natural language',
      pass: !hasSchemaKeyTitle(recommendation.title),
      hint: 'Edit the title to remove field names like currentArrangement.',
    },
    {
      label: 'No enable/disabled contradiction',
      pass: !contradictsEvidence(recommendation.title, quotes),
      hint: 'Edit the title so the action matches what the evidence says.',
    },
  ];
}

export function RecommendationChecklist({
  recommendation,
  reviewed,
  onReviewedChange,
}: Readonly<{
  recommendation: Recommendation;
  reviewed: boolean;
  onReviewedChange: (value: boolean) => void;
}>) {
  const checks = getRecommendationChecks(recommendation);

  return (
    <div className="mt-3 rounded-sm border border-border bg-background/40 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        Review checklist
      </p>
      <ul className="mt-2 grid gap-1.5">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-2 text-sm leading-6">
            <span
              aria-hidden="true"
              className={[
                'mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                check.pass ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger',
              ].join(' ')}
            >
              {check.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <span className="min-w-0">
              <span className={check.pass ? 'text-foreground' : 'font-medium text-foreground'}>
                {check.label}
              </span>
              {!check.pass && check.hint ? (
                <span className="block text-xs leading-5 text-muted-foreground">{check.hint}</span>
              ) : null}
              <span className="sr-only">{check.pass ? ' (pass)' : ' (needs attention)'}</span>
            </span>
          </li>
        ))}
      </ul>
      <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm leading-6 text-foreground">
        <input
          type="checkbox"
          checked={reviewed}
          onChange={(event) => onReviewedChange(event.target.checked)}
          className="mt-1.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span>I reviewed the transcript, facts, and proof behind this draft.</span>
      </label>
    </div>
  );
}
