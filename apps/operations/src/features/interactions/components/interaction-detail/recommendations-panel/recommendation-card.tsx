'use client';

import { useState } from 'react';
import { Check, Pencil, Send, X } from 'lucide-react';
import type {
  EditRecommendationDraftPatch,
  Recommendation,
  RecommendationStatus,
  ReviewRecommendationDecision,
} from '@orange-concierge/core';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { RecommendationProof } from './recommendation-citations';

type PendingAction = 'submit' | 'approve' | 'reject' | 'save';

const PRIORITY_VALUES = ['low', 'medium', 'high'] as const satisfies readonly Recommendation['priority'][];

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
  canEdit,
  onSubmitForReview,
  onReview,
  onEdit,
}: Readonly<{
  recommendation: Recommendation;
  index: number;
  total: number;
  canReview: boolean;
  canSubmitForReview: boolean;
  canEdit: boolean;
  onSubmitForReview: (recommendationId: string) => Promise<void>;
  onReview: (recommendationId: string, decision: ReviewRecommendationDecision) => Promise<void>;
  onEdit: (recommendationId: string, patch: EditRecommendationDraftPatch) => Promise<boolean>;
}>) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(recommendation.title);
  const [editSummary, setEditSummary] = useState(recommendation.summary);
  const [editPriority, setEditPriority] =
    useState<Recommendation['priority']>(recommendation.priority);
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

  const openEditor = () => {
    setEditTitle(recommendation.title);
    setEditSummary(recommendation.summary);
    setEditPriority(recommendation.priority);
    setIsEditing(true);
  };

  const hasEditChanges =
    editTitle.trim() !== recommendation.title ||
    editSummary.trim() !== recommendation.summary ||
    editPriority !== recommendation.priority;

  const runSaveEdit = async () => {
    setPendingAction('save');
    try {
      const saved = await onEdit(recommendation.id, {
        title: editTitle.trim(),
        summary: editSummary.trim(),
        priority: editPriority,
      });
      if (saved) {
        setIsEditing(false);
      }
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
        {isEditing ? (
          <div className="mt-2 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted-foreground">Title</span>
              <input
                type="text"
                value={editTitle}
                maxLength={80}
                onChange={(event) => setEditTitle(event.target.value)}
                disabled={disabled}
                aria-label="Recommendation title"
                className="h-9 w-full rounded-sm bg-surface-muted/60 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:bg-surface-muted disabled:opacity-50"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-muted-foreground">Summary</span>
              <textarea
                value={editSummary}
                rows={3}
                maxLength={180}
                onChange={(event) => setEditSummary(event.target.value)}
                disabled={disabled}
                aria-label="Recommendation summary"
                className="w-full rounded-sm bg-surface-muted/60 px-3 py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:bg-surface-muted disabled:opacity-50"
              />
            </label>
            <label className="grid gap-1 sm:max-w-56">
              <span className="text-xs font-semibold text-muted-foreground">Priority</span>
              <select
                value={editPriority}
                onChange={(event) =>
                  setEditPriority(event.target.value as Recommendation['priority'])
                }
                disabled={disabled}
                aria-label="Recommendation priority"
                className="h-9 w-full rounded-sm bg-surface-muted/60 px-3 text-sm text-foreground outline-none focus:bg-surface-muted disabled:opacity-50"
              >
                {PRIORITY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <>
            <h4 className="mt-2 max-w-3xl font-display text-xl font-medium leading-7 text-foreground">
              {recommendation.title}
            </h4>
            {showSummary ? (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                {recommendation.summary}
              </p>
            ) : null}
          </>
        )}
        <div className="mt-3">
          <RecommendationProof recommendation={recommendation} />
        </div>
        {recommendation.status === 'draft' && (canSubmitForReview || canEdit) ? (
          <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={disabled}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={runSaveEdit}
                  disabled={disabled || !hasEditChanges}
                  className="w-full sm:w-auto"
                >
                  {pendingAction === 'save' ? 'Saving...' : 'Save changes'}
                </Button>
              </>
            ) : (
              <>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={openEditor}
                    disabled={disabled}
                    className="w-full sm:w-auto"
                  >
                    <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                ) : null}
                {canSubmitForReview ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={runSubmitForReview}
                    disabled={disabled}
                    className="w-full sm:w-auto"
                  >
                    <Send aria-hidden="true" className="h-3.5 w-3.5" />
                    {pendingAction === 'submit' ? 'Submitting...' : 'Submit for review'}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        ) : recommendation.status === 'pending_review' && canReview ? (
          <div className="mt-3 flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => runReview('approved')}
              disabled={disabled}
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
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
