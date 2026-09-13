import { knowledgeChunks, knowledgeSources, type OrangeConciergeDB } from '../../database';
import type { KnowledgeIndexRepository } from '../../knowledge/ports';

export class DrizzleKnowledgeIndexRepository implements KnowledgeIndexRepository {
  constructor(
    private readonly db: OrangeConciergeDB,
    private readonly now: () => Date = () => new Date()
  ) {}

  async replaceCorpus(
    input: Parameters<KnowledgeIndexRepository['replaceCorpus']>[0]
  ): Promise<void> {
    const updatedAt = this.now();

    await this.db.transaction(async (tx) => {
      await tx.delete(knowledgeChunks);
      await tx.delete(knowledgeSources);

      if (input.sources.length > 0) {
        await tx.insert(knowledgeSources).values(
          input.sources.map((source) => ({
            id: source.id,
            title: source.title,
            path: source.path,
            contentHash: source.contentHash,
            updatedAt,
          }))
        );
      }

      if (input.chunks.length > 0) {
        await tx.insert(knowledgeChunks).values(
          input.chunks.map((chunk) => ({
            id: chunk.id,
            sourceId: chunk.sourceId,
            sourceTitle: chunk.sourceTitle,
            sourcePath: chunk.sourcePath,
            heading: chunk.heading,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            contentHash: chunk.contentHash,
            embedding: [...chunk.embedding],
            embeddingModel: chunk.embeddingModel,
            embeddingDimensions: chunk.embeddingDimensions,
            updatedAt,
          }))
        );
      }
    });
  }
}
