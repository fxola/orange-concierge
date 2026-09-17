import { parseRecommendationId, Recommendation } from '../../domain/recommendation';
import type { AuditEvent } from '../../ports/audit';
import {
  InvalidRecommendationIdError,
  InvalidRecommendationTransitionError,
  RecommendationEditFailedError,
  RecommendationNotFoundError,
  UnauthorizedEditRecommendationError,
} from '../../errors';
import { Result } from '../result';
import { canEditRecommendationDrafts } from './policy';
import type {
  EditRecommendationDraftDependencies,
  EditRecommendationDraftInput,
  EditRecommendationDraftResult,
} from './types';

export class EditRecommendationDraft {
  constructor(private readonly deps: EditRecommendationDraftDependencies) {}

  async execute(input: EditRecommendationDraftInput): Promise<EditRecommendationDraftResult> {
    const { actor, recommendationId, patch } = input;
    if (!canEditRecommendationDrafts(actor)) {
      return Result.failure(new UnauthorizedEditRecommendationError(actor.role));
    }

    const parsedRecommendationId = parseRecommendationId(recommendationId);
    if (!parsedRecommendationId.ok) {
      return Result.failure(new InvalidRecommendationIdError());
    }

    const recommendation = await this.deps.recommendationRepository.findById(
      parsedRecommendationId.recommendationId
    );

    if (!recommendation) {
      return Result.failure(
        new RecommendationNotFoundError(parsedRecommendationId.recommendationId)
      );
    }

    if (recommendation.status !== 'draft') {
      return Result.failure(
        new InvalidRecommendationTransitionError(recommendation.status, 'draft')
      );
    }

    const editResult = Recommendation.editDraft(recommendation, patch);
    if (editResult.isFailure()) {
      return Result.failure(editResult.getError());
    }
    const { recommendation: updatedRecommendation, changedFields } = editResult.getValue();
    const occurredAt = this.deps.now();
    const auditEvent: AuditEvent = {
      actor,
      action: 'recommendation_edited',
      resource: { type: 'recommendation', id: recommendation.id },
      occurredAt,
      metadata: {
        interactionId: recommendation.interactionId,
        clientId: recommendation.clientId,
        changedFields: changedFields.join(','),
      },
    };

    try {
      await this.deps.transactionManager.execute(async (tx) => {
        await tx.recommendations.save(updatedRecommendation);
        await tx.audit.record(auditEvent);
      });
    } catch (error) {
      return Result.failure(new RecommendationEditFailedError(error));
    }

    return Result.success(updatedRecommendation);
  }
}
