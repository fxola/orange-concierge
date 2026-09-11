'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { shortId } from '@/lib/short-id';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { analyzeInteraction } from '../presenters/analyze-interaction';
import type { InteractionRow } from '../view-models/interactions';
import { ExtractedFactsView } from './extracted-facts-view';
import { InteractionStatus } from './interaction-status';

function transcriptPreview(transcript: string): string {
  const compact = transcript.trim().replace(/\s+/g, ' ');

  if (compact.length <= 160) {
    return compact;
  }

  return `${compact.slice(0, 160)}…`;
}

export function InteractionCard({ row }: Readonly<{ row: InteractionRow }>) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const viewModel = await analyzeInteraction(row.id);

      if (viewModel.status === 'ok') {
        toast.success('Analysis complete.');
        router.refresh();
        return;
      }

      if (viewModel.unauthorized) {
        router.push('/login');
        router.refresh();
        return;
      }
      toast.error(viewModel.message);
      router.refresh();
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-sm border border-border bg-surface shadow-xs">
      <div className="px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <InteractionStatus status={row.status} />
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <span className="text-subtle-foreground">#{shortId(row.id)}</span>
            <span aria-hidden="true" className="text-border-strong">
              ·
            </span>
            <span className="text-muted-foreground tabular-nums">{row.createdAtLabel}</span>
          </p>
          {row.status === 'received' ? (
            <Button variant="outline" size="sm" onClick={onAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing…' : 'Analyze'}
            </Button>
          ) : null}
        </div>
        <p className="mt-2.5 line-clamp-2 text-sm leading-5">{transcriptPreview(row.transcript)}</p>
      </div>

      <details className="group border-t border-border bg-background/60">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 px-5 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-6 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform duration-150 group-open:rotate-180"
          />
          Transcript and analysis
        </summary>
        <div className="grid gap-4 px-5 pb-5 sm:px-6">
          <div className="rounded-sm bg-surface-muted/60 p-4">
            <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
              Full transcript
            </Text>
            <Text variant="small" className="mt-2 whitespace-pre-wrap">
              {row.transcript}
            </Text>
          </div>

          {row.status === 'analysis_blocked' ? (
            <Alert tone="danger" className="rounded-sm">
              Sensitive material detected. This transcript was not sent to the model.
            </Alert>
          ) : null}

          {row.status === 'analysis_completed' ? (
            <ExtractedFactsView facts={row.extractedFacts ?? {}} />
          ) : null}

          {row.status === 'received' ? (
            <Text variant="small" tone="muted">
              Run analysis to screen for sensitive material and extract structured facts.
            </Text>
          ) : null}
        </div>
      </details>
    </article>
  );
}
