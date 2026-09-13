import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Result, type SecretScannerAPI } from '@orange-concierge/core';
import type {
  KnowledgeEmbedderAPI,
  KnowledgeEmbeddingResult,
  KnowledgeIndexRepository,
} from './ports';
import type {
  EmbeddedKnowledgeChunkSnapshot,
  KnowledgeChunkSnapshot,
  KnowledgeIndexErrorDetails,
  KnowledgeIndexFailureReason,
  KnowledgeIndexSuccess,
  KnowledgeSourceSnapshot,
} from './types';

export type {
  EmbeddedKnowledgeChunkSnapshot,
  KnowledgeChunkSnapshot,
  KnowledgeIndexErrorDetails,
  KnowledgeIndexFailureReason,
  KnowledgeIndexSuccess,
  KnowledgeSourceSnapshot,
} from './types';

export class KnowledgeIndexError extends Error {
  readonly code = 'KNOWLEDGE_INDEX_FAILED';

  constructor(
    readonly reason: KnowledgeIndexFailureReason,
    message: string,
    readonly details: KnowledgeIndexErrorDetails = {}
  ) {
    super(message);
    this.name = 'KnowledgeIndexError';
  }
}

export type KnowledgeIndexResult = Result<KnowledgeIndexSuccess, KnowledgeIndexError>;

export type KnowledgeIndexOptions = {
  knowledgeDir?: string;
  dryRun?: boolean;
  embedder?: KnowledgeEmbedderAPI;
  store?: KnowledgeIndexRepository;
  secretScanner?: SecretScannerAPI;
};

const defaultKnowledgeDir = fileURLToPath(new URL('../../../../knowledge', import.meta.url));

export async function indexKnowledgeCorpus(
  options: KnowledgeIndexOptions = {}
): Promise<KnowledgeIndexResult> {
  const knowledgeDir = resolve(options.knowledgeDir ?? defaultKnowledgeDir);
  let fileNames: string[];

  try {
    fileNames = (await readdir(knowledgeDir))
      .filter((fileName) => fileName.endsWith('.md'))
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    return Result.failure(
      new KnowledgeIndexError('corpus_read_failed', 'Could not read knowledge directory.', {
        knowledgeDir,
        cause: getErrorMessage(error),
      })
    );
  }

  const sources: KnowledgeSourceSnapshot[] = [];
  const chunks: KnowledgeChunkSnapshot[] = [];

  for (const fileName of fileNames) {
    const sourcePath = `knowledge/${fileName}`;
    const sourceId = sourcePath;
    let content: string;

    try {
      content = normalizeMarkdown(await readFile(resolve(knowledgeDir, fileName), 'utf8'));
    } catch (error) {
      return Result.failure(
        new KnowledgeIndexError('source_read_failed', 'Could not read knowledge source.', {
          sourcePath,
          cause: getErrorMessage(error),
        })
      );
    }

    const secretScan = options.secretScanner?.scan({ text: content });

    if (secretScan !== undefined && secretScan.findings.length > 0) {
      return Result.failure(
        new KnowledgeIndexError(
          'prohibited_secret',
          `Knowledge source contains prohibited secret content: ${sourcePath}`,
          {
            sourcePath,
            findingCount: secretScan.findings.length,
          }
        )
      );
    }

    const title = extractTitle(content, fileName);

    sources.push({
      id: sourceId,
      title,
      path: sourcePath,
      contentHash: hashText(content),
    });

    chunks.push(
      ...chunkMarkdown(content).map((chunk, chunkIndex) => ({
        id: `${sourceId}#${chunkIndex}`,
        sourceId,
        sourceTitle: title,
        sourcePath,
        heading: chunk.heading,
        chunkIndex,
        content: chunk.content,
        contentHash: hashText(chunk.content),
      }))
    );
  }

  const result: KnowledgeIndexSuccess = {
    sourceCount: sources.length,
    chunkCount: chunks.length,
    sources,
    chunks,
  };

  if (options.dryRun === true) {
    return Result.success(result);
  }

  if (options.embedder === undefined || options.store === undefined) {
    return Result.failure(
      new KnowledgeIndexError(
        'missing_dependencies',
        'Knowledge indexing requires an embedder and repository unless dry-run mode is enabled.'
      )
    );
  }

  let embedded: KnowledgeEmbeddingResult;

  try {
    embedded = await options.embedder.embedTexts({
      texts: chunks.map((chunk) => chunk.content),
    });
  } catch (error) {
    return Result.failure(
      new KnowledgeIndexError('embedding_failed', 'Knowledge embedding generation failed.', {
        cause: getErrorMessage(error),
      })
    );
  }

  if (embedded.embeddings.length !== chunks.length) {
    return Result.failure(
      new KnowledgeIndexError(
        'embedding_count_mismatch',
        'Knowledge embedder returned a different embedding count than chunk count.',
        {
          expectedCount: chunks.length,
          actualCount: embedded.embeddings.length,
        }
      )
    );
  }

  const embeddedChunks: EmbeddedKnowledgeChunkSnapshot[] = [];

  for (const [index, chunk] of chunks.entries()) {
    const embedding = embedded.embeddings[index];

    if (embedding === undefined) {
      return Result.failure(
        new KnowledgeIndexError(
          'embedding_count_mismatch',
          'Knowledge embedder returned a missing embedding.',
          {
            expectedCount: chunks.length,
            actualCount: embedded.embeddings.length,
          }
        )
      );
    }

    if (embedding.length !== embedded.dimensions) {
      return Result.failure(
        new KnowledgeIndexError(
          'embedding_dimension_mismatch',
          'Knowledge embedder returned an embedding with the wrong dimensions.',
          {
            expectedDimensions: embedded.dimensions,
            actualDimensions: embedding.length,
          }
        )
      );
    }

    embeddedChunks.push({
      ...chunk,
      embedding,
      embeddingModel: embedded.model,
      embeddingDimensions: embedded.dimensions,
    });
  }

  try {
    await options.store.replaceCorpus({
      sources,
      chunks: embeddedChunks,
    });
  } catch (error) {
    return Result.failure(
      new KnowledgeIndexError('storage_failed', 'Knowledge index persistence failed.', {
        cause: getErrorMessage(error),
      })
    );
  }

  return Result.success(result);
}

function normalizeMarkdown(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function extractTitle(content: string, fileName: string): string {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();

  return heading ?? fileName.replace(/\.md$/, '').replace(/-/g, ' ');
}

function chunkMarkdown(content: string): Array<{ heading: string | null; content: string }> {
  const chunks: Array<{ heading: string | null; lines: string[] }> = [];
  let current: { heading: string | null; lines: string[] } = {
    heading: extractTitle(content, ''),
    lines: [],
  };

  for (const line of content.split('\n')) {
    const heading = line.match(/^##\s+(.+)$/)?.[1]?.trim();

    if (heading !== undefined) {
      pushChunk(chunks, current);
      current = { heading, lines: [line] };
      continue;
    }

    current.lines.push(line);
  }

  pushChunk(chunks, current);

  return chunks.map((chunk) => ({
    heading: chunk.heading,
    content: chunk.lines.join('\n').trim(),
  }));
}

function pushChunk(
  chunks: Array<{ heading: string | null; lines: string[] }>,
  chunk: { heading: string | null; lines: string[] }
): void {
  if (chunk.lines.join('\n').trim().length === 0) {
    return;
  }

  chunks.push(chunk);
}

function hashText(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
