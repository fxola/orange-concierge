import { PatternSecretScanner } from '@orange-concierge/security';
import { createDatabaseFromUrl } from '../database';
import { env } from '../env';
import { GeminiKnowledgeEmbedder } from '../adapters/knowledge/gemini-knowledge-embedder';
import { OllamaKnowledgeEmbedder } from '../adapters/knowledge/ollama-knowledge-embedder';
import { DrizzleKnowledgeIndexRepository } from '../adapters/knowledge/drizzle-knowledge-index-repository';
import { indexKnowledgeCorpus } from './indexer';
import type { KnowledgeEmbedderAPI } from './ports';

const DEFAULT_OLLAMA_KNOWLEDGE_EMBEDDING_MODEL = 'nomic-embed-text';
const DEFAULT_GEMINI_KNOWLEDGE_EMBEDDING_MODEL = 'text-embedding-004';

async function run(): Promise<void> {
  const { db, client } = createDatabaseFromUrl(env.DATABASE_URL);

  try {
    const result = await indexKnowledgeCorpus({
      embedder: createKnowledgeEmbedder(),
      store: new DrizzleKnowledgeIndexRepository(db),
      secretScanner: new PatternSecretScanner(),
    });

    if (result.isFailure()) {
      const error = result.getError();
      console.error('Knowledge indexing failed:', error.message);
      if (Object.keys(error.details).length > 0) {
        console.error('Details:', error.details);
      }
      process.exitCode = 1;
      return;
    }

    const indexed = result.getValue();

    console.log(
      `Indexed ${indexed.sourceCount} knowledge sources into ${indexed.chunkCount} chunks.`
    );
  } finally {
    await client.end();
  }
}

function createKnowledgeEmbedder(): KnowledgeEmbedderAPI {
  if (env.AI_PROVIDER === 'gemini') {
    return new GeminiKnowledgeEmbedder({
      apiKey: env.AI_API_KEY ?? '',
      model: DEFAULT_GEMINI_KNOWLEDGE_EMBEDDING_MODEL,
      baseUrl: env.AI_BASE_URL,
      timeoutMs: env.AI_TIMEOUT_MS,
    });
  }

  return new OllamaKnowledgeEmbedder({
    model: DEFAULT_OLLAMA_KNOWLEDGE_EMBEDDING_MODEL,
    baseUrl: env.AI_BASE_URL,
    timeoutMs: env.AI_TIMEOUT_MS,
  });
}

run().catch((error: unknown) => {
  console.error('Knowledge indexing failed:', error);
  process.exitCode = 1;
});
