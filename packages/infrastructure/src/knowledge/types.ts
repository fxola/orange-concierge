export type KnowledgeSourceSnapshot = {
  id: string;
  title: string;
  path: string;
  contentHash: string;
};

export type KnowledgeChunkSnapshot = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourcePath: string;
  heading: string | null;
  chunkIndex: number;
  content: string;
  contentHash: string;
};

export type EmbeddedKnowledgeChunkSnapshot = KnowledgeChunkSnapshot & {
  embedding: readonly number[];
  embeddingModel: string;
  embeddingDimensions: number;
};

export type KnowledgeIndexSuccess = {
  sourceCount: number;
  chunkCount: number;
  sources: KnowledgeSourceSnapshot[];
  chunks: KnowledgeChunkSnapshot[];
};

export type KnowledgeIndexFailureReason =
  | 'corpus_read_failed'
  | 'source_read_failed'
  | 'prohibited_secret'
  | 'missing_dependencies'
  | 'embedding_failed'
  | 'embedding_count_mismatch'
  | 'embedding_dimension_mismatch'
  | 'storage_failed';

export type KnowledgeIndexErrorDetails = Readonly<
  Partial<{
    knowledgeDir: string;
    sourcePath: string;
    findingCount: number;
    expectedCount: number;
    actualCount: number;
    expectedDimensions: number;
    actualDimensions: number;
    cause: string;
  }>
>;
