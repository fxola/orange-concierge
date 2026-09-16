import type { AuditEvent, TransactionalWriter } from '../../../src';
import type { Recommendation } from '../../../src/domain/recommendation';
import {
  RecommendationTransactionalPorts,
  RecommendationTransactionManager,
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

    const recommendations: TransactionalWriter<Recommendation> = {
      save: (recommendation: Recommendation) => this.recommendationRepository.save(recommendation),
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
