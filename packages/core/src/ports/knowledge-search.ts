export type KnowledgeSearchRequest = Readonly<{
  query: string;
  limit: number;
}>;

export type KnowledgeSearchHit = Readonly<{
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  sourcePath: string;
  heading: string | null;
  content: string;
  score: number;
}>;

export interface KnowledgeRetriever {
  search(request: KnowledgeSearchRequest): Promise<readonly KnowledgeSearchHit[]>;
}
