import type {
  KnowledgeRetriever,
  KnowledgeSearchHit,
  KnowledgeSearchRequest,
} from '@orange-concierge/core';
import { cosineDistance, sql } from 'drizzle-orm';

import { knowledgeChunks, type OrangeConciergeDB } from '../../database';
import type { KnowledgeEmbedderAPI } from '../../knowledge/ports';

type KnowledgeSearchRow = Readonly<{
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  sourcePath: string;
  heading: string | null;
  content: string;
  distance: number | string;
}>;

function toScore(distance: number | string): number {
  const numericDistance = typeof distance === 'number' ? distance : Number(distance);

  return Math.max(0, Math.min(1, 1 - numericDistance));
}

function toHit(row: KnowledgeSearchRow): KnowledgeSearchHit {
  return {
    chunkId: row.chunkId,
    sourceId: row.sourceId,
    sourceTitle: row.sourceTitle,
    sourcePath: row.sourcePath,
    heading: row.heading,
    content: row.content,
    score: toScore(row.distance),
  };
}

export class DrizzleKnowledgeSearch implements KnowledgeRetriever {
  constructor(
    private readonly db: OrangeConciergeDB,
    private readonly embedder: KnowledgeEmbedderAPI
  ) {}

  async search(request: KnowledgeSearchRequest): Promise<readonly KnowledgeSearchHit[]> {
    const embeddingResult = await this.embedder.embedTexts({ texts: [request.query] });
    const [embedding] = embeddingResult.embeddings;

    if (!embedding) {
      return [];
    }

    const distance = cosineDistance(knowledgeChunks.embedding, [...embedding]);
    const rows = (await this.db.execute(sql`
      select
        ${knowledgeChunks.id} as "chunkId",
        ${knowledgeChunks.sourceId} as "sourceId",
        ${knowledgeChunks.sourceTitle} as "sourceTitle",
        ${knowledgeChunks.sourcePath} as "sourcePath",
        ${knowledgeChunks.heading} as "heading",
        ${knowledgeChunks.content} as "content",
        ${distance} as "distance"
      from ${knowledgeChunks}
      where ${knowledgeChunks.embeddingModel} = ${embeddingResult.model}
        and ${knowledgeChunks.embeddingDimensions} = ${embeddingResult.dimensions}
      order by ${distance} asc
      limit ${request.limit}
    `)) as unknown as readonly KnowledgeSearchRow[];

    return rows.map(toHit);
  }
}
