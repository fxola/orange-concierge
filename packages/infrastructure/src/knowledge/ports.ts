import type { EmbeddedKnowledgeChunkSnapshot, KnowledgeSourceSnapshot } from './types.js';

export type KnowledgeEmbeddingResult = {
  model: string;
  dimensions: number;
  embeddings: readonly (readonly number[])[];
};

export interface KnowledgeEmbedderAPI {
  embedTexts(input: { texts: readonly string[] }): Promise<KnowledgeEmbeddingResult>;
}

export interface KnowledgeIndexRepository {
  replaceCorpus(input: {
    sources: readonly KnowledgeSourceSnapshot[];
    chunks: readonly EmbeddedKnowledgeChunkSnapshot[];
  }): Promise<void>;
}
