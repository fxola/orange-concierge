import type { AIConfig } from '@orange-concierge/ai';

import { GeminiKnowledgeEmbedder } from '../adapters/knowledge/gemini-knowledge-embedder';
import { OllamaKnowledgeEmbedder } from '../adapters/knowledge/ollama-knowledge-embedder';
import type { KnowledgeEmbedderAPI } from './ports';

const DEFAULT_OLLAMA_KNOWLEDGE_EMBEDDING_MODEL = 'nomic-embed-text';
const DEFAULT_GEMINI_KNOWLEDGE_EMBEDDING_MODEL = 'text-embedding-004';

export function createKnowledgeEmbedder(config: AIConfig): KnowledgeEmbedderAPI {
  const baseConfig = {
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    fetch: config.fetch,
  };

  if (config.provider === 'gemini') {
    return new GeminiKnowledgeEmbedder({
      ...baseConfig,
      apiKey: config.apiKey,
      model: DEFAULT_GEMINI_KNOWLEDGE_EMBEDDING_MODEL,
    });
  }

  return new OllamaKnowledgeEmbedder({
    ...baseConfig,
    model: DEFAULT_OLLAMA_KNOWLEDGE_EMBEDDING_MODEL,
  });
}
