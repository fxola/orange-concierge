import type {
  KnowledgeRetriever,
  KnowledgeSearchHit,
  KnowledgeSearchRequest,
} from '../../../src/ports/knowledge-retriever';

export class InMemoryKnowledgeRetriever implements KnowledgeRetriever {
  readonly requests: Array<{ query: string; limit: number }> = [];

  constructor(
    private readonly operations: string[],
    private readonly hits: readonly KnowledgeSearchHit[]
  ) {}

  async search(request: { query: string; limit: number }): Promise<readonly KnowledgeSearchHit[]> {
    this.operations.push('retrieve');
    this.requests.push(request);
    return this.hits;
  }
}
