'use client';

import { useState } from 'react';
import { Check, Send, X } from 'lucide-react';
import type {
  Recommendation,
  RecommendationStatus,
  ReviewRecommendationDecision,
} from '@orange-concierge/core';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { RecommendationProof } from './recommendation-citations';

type PendingAction = 'submit' | 'approve' | 'reject';

const STATUS_LABELS: Record<RecommendationStatus, string> = {
  draft: 'Draft',
  superseded: 'Superseded',
  pending_review: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const PRIORITY_LABELS: Record<Recommendation['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function RecommendationCard({
  recommendation,
  index,
  total,
  canReview,
  canSubmitForReview,
  onSubmitForReview,
  onReview,
}: Readonly<{
  recommendation: Recommendation;
  index: number;
  total: number;
  canReview: boolean;
  canSubmitForReview: boolean;
  onSubmitForReview: (recommendationId: string) => Promise<void>;
  onReview: (recommendationId: string, decision: ReviewRecommendationDecision) => Promise<void>;
}>) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const disabled = pendingAction !== null;

  const runSubmitForReview = async () => {
    setPendingAction('submit');
    try {
      await onSubmitForReview(recommendation.id);
    } finally {
      setPendingAction(null);
    }
  };

  const runReview = async (decision: ReviewRecommendationDecision) => {
    setPendingAction(decision === 'approved' ? 'approve' : 'reject');
    try {
      await onReview(recommendation.id, decision);
    } finally {
      setPendingAction(null);
    }
  };

  const showSummary =
    recommendation.summary.trim().length > 0 &&
    recommendation.summary.trim().toLowerCase() !== recommendation.title.trim().toLowerCase();

  return (
    <article className="overflow-hidden rounded-md border border-border bg-surface-raised shadow-xs">
      <div className="px-4 py-4">
        <Text variant="caption" tone="muted" className="tabular-nums">
          {index + 1} of {total} • {PRIORITY_LABELS[recommendation.priority]} •{' '}
          {STATUS_LABELS[recommendation.status]}
        </Text>
        <h4 className="mt-2 max-w-3xl font-display text-xl font-medium leading-7 text-foreground">
          {recommendation.title}
        </h4>
        {showSummary ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {recommendation.summary}
          </p>
        ) : null}
        <div className="mt-3">
          <RecommendationProof recommendation={recommendation} />
        </div>
        {recommendation.status === 'draft' && canSubmitForReview ? (
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={runSubmitForReview}
              disabled={disabled}
            >
              <Send aria-hidden="true" className="h-3.5 w-3.5" />
              {pendingAction === 'submit' ? 'Submitting...' : 'Submit for review'}
            </Button>
          </div>
        ) : recommendation.status === 'pending_review' && canReview ? (
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => runReview('approved')}
              disabled={disabled}
            >
              <Check aria-hidden="true" className="h-3.5 w-3.5" />
              {pendingAction === 'approve' ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={() => runReview('rejected')}
              disabled={disabled}
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
              {pendingAction === 'reject' ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
