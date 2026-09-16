import type { Interaction } from '../domain/interaction';
import type { Recommendation } from '../domain/recommendation';
import type { AuditPort } from './audit';

export interface TransactionalWriter<T> {
  save(entity: T): Promise<void>;
}

export interface TransactionManager<TPorts> {
  execute<T>(commit: (tx: TPorts) => Promise<T>): Promise<T>;
}

export interface TransactionalRecommendationWriter extends TransactionalWriter<Recommendation> {
  supersedeDraftsByInteractionId(interactionId: string, supersededAt: Date): Promise<void>;
}

export interface InteractionTransactionalPorts {
  interactions: TransactionalWriter<Interaction>;
  audit: AuditPort;
}

export interface RecommendationTransactionalPorts {
  recommendations: TransactionalRecommendationWriter;
  audit: AuditPort;
}

export type InteractionTransactionManager = TransactionManager<InteractionTransactionalPorts>;

export type RecommendationTransactionManager = TransactionManager<RecommendationTransactionalPorts>;
