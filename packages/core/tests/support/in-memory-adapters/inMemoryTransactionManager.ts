import type {
  TransactionalInteractionWriter,
  TransactionalPorts,
  TransactionManager,
} from '../../../src/ports/transaction-manager';
import type { AuditEvent } from '../../../src/ports/audit';
import type { Interaction } from '../../../src/domain/interaction';
import type { InMemoryInteractionRepository } from './inMemoryInteractionRepository';
import type { RecordingAudit } from './inMemoryAuditPort';

export class InMemoryTransactionManager implements TransactionManager {
  private failTransactionalAuditNext = false;

  constructor(
    private readonly interactionsRepo: InMemoryInteractionRepository,
    private readonly audit: RecordingAudit
  ) {}

  failNextTransactionalAudit(): void {
    this.failTransactionalAuditNext = true;
  }

  failTransactionalAudit(): void {
    this.failNextTransactionalAudit();
  }

  async execute<T>(work: (tx: TransactionalPorts) => Promise<T>): Promise<T> {
    const interactionSnapshot = this.interactionsRepo.snapshot();
    const auditSnapshot = this.audit.snapshot();

    const interactions: TransactionalInteractionWriter = {
      save: (interaction: Interaction) => this.interactionsRepo.save(interaction),
    };

    const tx: TransactionalPorts = {
      interactions,
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
      this.interactionsRepo.restore(interactionSnapshot);
      this.audit.restore(auditSnapshot);
      throw error;
    }
  }
}
