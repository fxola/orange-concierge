import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export type KnowledgeIndexResult = {
  sourceCount: number;
  chunkCount: number;
  sources: KnowledgeSourceSnapshot[];
  chunks: KnowledgeChunkSnapshot[];
};

export type KnowledgeIndexOptions = {
  knowledgeDir?: string;
  dryRun?: boolean;
};

const defaultKnowledgeDir = fileURLToPath(new URL('../../../../knowledge', import.meta.url));

export async function indexKnowledgeCorpus(
  options: KnowledgeIndexOptions = {}
): Promise<KnowledgeIndexResult> {
  const knowledgeDir = resolve(options.knowledgeDir ?? defaultKnowledgeDir);
  const fileNames = (await readdir(knowledgeDir))
    .filter((fileName) => fileName.endsWith('.md'))
    .sort((left, right) => left.localeCompare(right));

  const sources: KnowledgeSourceSnapshot[] = [];
  const chunks: KnowledgeChunkSnapshot[] = [];

  for (const fileName of fileNames) {
    const sourcePath = `knowledge/${fileName}`;
    const sourceId = sourcePath;
    const content = normalizeMarkdown(await readFile(resolve(knowledgeDir, fileName), 'utf8'));
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

  return {
    sourceCount: sources.length,
    chunkCount: chunks.length,
    sources,
    chunks,
  };
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
