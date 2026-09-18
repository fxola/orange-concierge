import type {
  InteractionTransactionManager,
  InteractionTransactionalPorts,
  TransactionalWriter,
} from '../../../src/ports/transaction-manager';
import type { AuditEvent } from '../../../src/ports/audit';
import type { AuditEventFilter } from '../../../src/domain/audit';
import type { Interaction } from '../../../src/domain/interaction';
import type { InMemoryInteractionRepository } from './inMemoryInteractionRepository';
import type { RecordingAudit } from './inMemoryAuditPort';

export class InMemoryTransactionManager implements InteractionTransactionManager {
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

  async execute<T>(work: (tx: InteractionTransactionalPorts) => Promise<T>): Promise<T> {
    const interactionSnapshot = this.interactionsRepo.snapshot();
    const auditSnapshot = this.audit.snapshot();

    const interactions: TransactionalWriter<Interaction> = {
      save: (interaction: Interaction) => this.interactionsRepo.save(interaction),
    };

    const tx: InteractionTransactionalPorts = {
      interactions,
      audit: {
        record: async (event: AuditEvent) => {
          if (this.failTransactionalAuditNext) {
            this.failTransactionalAuditNext = false;
            throw new Error('Transactional audit recording failed');
          }
          return this.audit.record(event);
        },
        list: (filter: AuditEventFilter) => this.audit.list(filter),
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
