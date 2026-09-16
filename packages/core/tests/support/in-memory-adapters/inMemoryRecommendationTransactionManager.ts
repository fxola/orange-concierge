import type { AuditEvent } from '../../../src';
import type { Recommendation } from '../../../src/domain/recommendation';
import {
  RecommendationTransactionalPorts,
  RecommendationTransactionManager,
  type TransactionalRecommendationWriter,
} from '../../../src/ports/transaction-manager';
import type { RecordingAudit } from './inMemoryAuditPort';
import type { InMemoryRecommendationRepository } from './inMemoryRecommendationRepository';

export class InMemoryRecommendationReviewTransactionManager implements RecommendationTransactionManager {
  private failTransactionalAuditNext = false;

  constructor(
    private readonly recommendationRepository: InMemoryRecommendationRepository,
    private readonly audit: RecordingAudit
  ) {}

  failNextTransactionalAudit(): void {
    this.failTransactionalAuditNext = true;
  }

  async execute<T>(work: (tx: RecommendationTransactionalPorts) => Promise<T>): Promise<T> {
    const recommendationSnapshot = this.recommendationRepository.snapshot();
    const auditSnapshot = this.audit.snapshot();

    const recommendations: TransactionalRecommendationWriter = {
      save: (recommendation: Recommendation) => this.recommendationRepository.save(recommendation),
      supersedeDraftsByInteractionId: async (interactionId: string, supersededAt: Date) => {
        // Snapshot iteration to avoid mutation during iteration
        const current = [...(this.recommendationRepository as any).recommendations] as Recommendation[];
        for (const rec of current) {
          if (rec.interactionId === interactionId && rec.status === 'draft') {
            const updated: Recommendation = { ...rec, status: 'superseded', supersededAt };
            await this.recommendationRepository.save(updated);
          }
        }
      },
    };

    const tx: RecommendationTransactionalPorts = {
      recommendations,
      audit: {
        record: async (event: AuditEvent) => {
          if (this.failTransactionalAuditNext) {
            this.failTransactionalAuditNext = false;
            throw new Error('Transactional audit recording failed');
          }
          return this.audit.record(event);
        },
      },
    };

    try {
      return await work(tx);
    } catch (error) {
      this.recommendationRepository.restore(recommendationSnapshot);
      this.audit.restore(auditSnapshot);
      throw error;
    }
  }
}
