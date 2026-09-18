'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type {
  EditRecommendationDraftPatch,
  InteractionStatus,
  ReviewRecommendationDecision,
} from '@orange-concierge/core';

import { Button } from '@/components/ui/button';
import { generateRecommendations } from '../../../presenters/generate-recommendations';
import {
  editRecommendationDraft,
  reviewRecommendation,
  submitRecommendationForReview,
} from '../../../presenters/review-recommendation';
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
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  if (status !== 'analysis_completed') {
    return null;
  }

  const recommendations =
    recommendationsVm.status === 'ok' ? recommendationsVm.recommendations : [];
  const canReview = recommendationsVm.status === 'ok' ? recommendationsVm.canReview : false;
  const canSubmitForReview =
    recommendationsVm.status === 'ok' ? recommendationsVm.canSubmitForReview : false;
  const canEdit = recommendationsVm.status === 'ok' ? recommendationsVm.canEdit : false;

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

  const onSubmitForReview = async (recommendationId: string) => {
    const viewModel = await submitRecommendationForReview(recommendationId);

    if (viewModel.status === 'ok') {
      toast.success('Recommendation submitted for review.');
      router.refresh();
      return;
    }

    if (viewModel.unauthorized) {
      router.push('/login');
      router.refresh();
      return;
    }

    toast.error(viewModel.message);
  };

  const onReview = async (recommendationId: string, decision: ReviewRecommendationDecision) => {
    const viewModel = await reviewRecommendation(recommendationId, decision);

    if (viewModel.status === 'ok') {
      toast.success(
        decision === 'approved' ? 'Recommendation approved.' : 'Recommendation rejected.'
      );
      router.refresh();
      return;
    }

    if (viewModel.unauthorized) {
      router.push('/login');
      router.refresh();
      return;
    }

    toast.error(viewModel.message);
  };

  const onEdit = async (
    recommendationId: string,
    patch: EditRecommendationDraftPatch
  ): Promise<boolean> => {
    const viewModel = await editRecommendationDraft(recommendationId, patch);

    if (viewModel.status === 'ok') {
      toast.success('Draft updated.');
      router.refresh();
      return true;
    }

    if (viewModel.unauthorized) {
      router.push('/login');
      router.refresh();
      return false;
    }

    toast.error(viewModel.message);
    return false;
  };

  return (
    <div className="rounded-sm border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-medium leading-7">
            Recommendations{recommendations.length > 0 ? ` (${recommendations.length})` : ''}
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full sm:w-auto"
        >
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
              total={recommendations.length}
              canReview={canReview}
              canSubmitForReview={canSubmitForReview}
              canEdit={canEdit}
              onSubmitForReview={onSubmitForReview}
              onReview={onReview}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
