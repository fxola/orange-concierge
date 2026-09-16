'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { InteractionStatus } from '@orange-concierge/core';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { generateRecommendations } from '../../../presenters/generate-recommendations';
import type { RecommendationsViewModel } from '../../../view-models/recommendations';
import { RecommendationCard } from './recommendation-card';
import { Alert } from '@/components/ui/card';

export function RecommendationsPanel({
  interactionId,
  status,
  recommendationsVm,
}: Readonly<{
  interactionId: string;
  status: InteractionStatus;
  recommendationsVm: RecommendationsViewModel;
}>) {
  if (status !== 'analysis_completed') {
    return null;
  }

  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const recommendations =
    recommendationsVm.status === 'ok' ? recommendationsVm.recommendations : [];

  const onGenerate = async () => {
    setIsGenerating(true);

    try {
      const viewModel = await generateRecommendations(interactionId);

      if (viewModel.status === 'ok') {
        if (viewModel.recommendations.length === 0) {
          toast.error('No grounded recommendations returned.');
        } else {
          toast.success('Grounded recommendations generated.');
        }
        router.refresh();
        return;
      }

      if (viewModel.unauthorized) {
        router.push('/login');
        router.refresh();
        return;
      }

      toast.error(viewModel.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-sm border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            Grounded recommendations
          </Text>
          <h3 className="mt-1 font-display text-xl font-medium leading-7">
            Drafts backed by transcript proof and internal guidance
          </h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Only recommendations with at least one resolved client quote and one retrieved knowledge
            source are shown here.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onGenerate} disabled={isGenerating}>
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>

      <div className="mt-4 grid gap-4">
        {recommendationsVm.status === 'empty' ? (
          <div className="rounded-sm border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted-foreground">
            Generate recommendations after analysis to inspect the exact evidence and source chunks
            behind each draft.
          </div>
        ) : recommendationsVm.status === 'unavailable' ? (
          <Alert tone="warning" className="rounded-sm">
            Unable to load recommendations. Please refresh the page.
          </Alert>
        ) : recommendations.length === 0 ? (
          <Alert tone="warning" className="rounded-sm">
            No recommendation passed grounding checks. The model may need more transcript evidence
            or more relevant indexed guidance.
          </Alert>
        ) : (
          recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={`${recommendation.id ?? recommendation.title}-${index}`}
              recommendation={recommendation}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
