'use client';

import { useEffect, useRef } from 'react';
import { Quote, X } from 'lucide-react';
import { Text } from '@/components/ui/text';
import type { EvidenceReference } from '@orange-concierge/core';

function TranscriptWithHighlight({
  transcript,
  evidence,
}: Readonly<{ transcript: string; evidence: EvidenceReference }>) {
  const markRef = useRef<HTMLElement | null>(null);
  const canHighlight =
    evidence.startOffset >= 0 &&
    evidence.endOffset <= transcript.length &&
    evidence.startOffset < evidence.endOffset;

  useEffect(() => {
    if (!canHighlight) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    markRef.current?.scrollIntoView({
      block: 'center',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [canHighlight, evidence.factPath, evidence.startOffset]);

  if (!canHighlight) {
    return <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">{transcript}</p>;
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
      {transcript.slice(0, evidence.startOffset)}
      <mark ref={markRef} className="bg-primary px-1 py-0.5 text-foreground">
        {transcript.slice(evidence.startOffset, evidence.endOffset)}
      </mark>
      {transcript.slice(evidence.endOffset)}
    </p>
  );
}

export function EvidenceDialog({
  evidence,
  transcript,
  onClose,
}: Readonly<{ evidence: EvidenceReference; transcript: string; onClose: () => void }>) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Transcript evidence"
      className="fixed bottom-4 right-4 z-50 w-[min(680px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-surface-raised shadow-md transition-[opacity,transform] duration-150 ease-cubic"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            Transcript evidence
          </Text>
          <p className="mt-1 font-display text-lg font-medium leading-6">Highlighted source</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The highlighted words are the source for the selected fact.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close transcript evidence"
          onClick={onClose}
          className="inline-flex cursor-pointer h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-150 ease-cubic hover:bg-surface-muted hover:text-foreground active:scale-[0.97]"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 p-4">
        <figure className="rounded-md border border-warning/30 bg-warning-surface px-3 py-2.5">
          <figcaption className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-warning">
            <Quote aria-hidden="true" className="h-3.5 w-3.5" />
            Evidence quote
          </figcaption>
          <blockquote className="font-display text-[15px] leading-6 text-foreground">
            "{evidence.quote}"
          </blockquote>
        </figure>

        <div className="max-h-[52dvh] overflow-y-auto rounded-md border border-border bg-background/65 p-3">
          <TranscriptWithHighlight transcript={transcript} evidence={evidence} />
        </div>
      </div>
    </div>
  );
}
