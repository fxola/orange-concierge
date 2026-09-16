import type { Interaction } from '../domain/interaction';
import type { Recommendation } from '../domain/recommendation';
import type { AuditPort } from './audit';

export interface TransactionalWriter<T> {
  save(entity: T): Promise<void>;
}

export interface TransactionManager<TPorts> {
  execute<T>(commit: (tx: TPorts) => Promise<T>): Promise<T>;
}

export interface InteractionTransactionalPorts {
  interactions: TransactionalWriter<Interaction>;
  audit: AuditPort;
}

export interface RecommendationReviewTransactionalPorts {
  recommendations: TransactionalWriter<Recommendation>;
  audit: AuditPort;
}

export type InteractionTransactionManager = TransactionManager<InteractionTransactionalPorts>;

export type RecommendationReviewTransactionManager =
  TransactionManager<RecommendationReviewTransactionalPorts>;
