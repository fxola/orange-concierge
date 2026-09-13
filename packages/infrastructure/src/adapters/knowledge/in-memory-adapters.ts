import type { EmbeddedKnowledgeChunkSnapshot } from '../../knowledge/types';
import type { KnowledgeEmbedderAPI, KnowledgeIndexRepository } from '../../knowledge/ports';

export class InMemoryKnowledgeEmbedder implements KnowledgeEmbedderAPI {
  readonly requests: Array<{ texts: readonly string[] }> = [];

  async embedTexts(input: { texts: readonly string[] }) {
    this.requests.push(input);

    return {
      model: 'fake-embedding-model',
      dimensions: 3,
      embeddings: input.texts.map(() => [0.01, 0.02, 0.03] as const),
    };
  }
}

export class inMemoryKnowledgeIndexRepository implements KnowledgeIndexRepository {
  readonly replacements: Array<{
    sources: readonly unknown[];
    chunks: readonly EmbeddedKnowledgeChunkSnapshot[];
  }> = [];

  async replaceCorpus(input: {
    sources: readonly unknown[];
    chunks: readonly EmbeddedKnowledgeChunkSnapshot[];
  }): Promise<void> {
    this.replacements.push(input);
  }
}
