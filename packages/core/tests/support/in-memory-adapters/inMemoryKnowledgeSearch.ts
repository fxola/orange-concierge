import type {
  KnowledgeRetriever,
  KnowledgeSearchHit,
  KnowledgeSearchRequest,
} from '../../../src/ports/knowledge-search.js';

export class InMemoryKnowledgeSearch implements KnowledgeRetriever {
  constructor(private readonly hits: readonly KnowledgeSearchHit[]) {}

  async search(request: KnowledgeSearchRequest): Promise<readonly KnowledgeSearchHit[]> {
    return this.hits;
  }
}
