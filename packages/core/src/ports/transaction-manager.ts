import type { Interaction } from '../domain/interaction';
import type { AuditPort } from './audit';

export interface TransactionalInteractionWriter {
  save(interaction: Interaction): Promise<void>;
}

export interface TransactionalPorts {
  interactions: TransactionalInteractionWriter;
  audit: AuditPort;
}

export interface TransactionManager {
  execute<T>(commit: (tx: TransactionalPorts) => Promise<T>): Promise<T>;
}
