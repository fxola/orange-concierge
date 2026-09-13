import {
  DEFAULT_PROVIDER_TIMEOUT_MS,
  isRecord,
  normalizeProviderBaseUrl,
  normalizeProviderModel,
  postProviderJson,
  type ProviderFetch,
} from '@orange-concierge/ai';
import type { KnowledgeEmbedderAPI } from '../../knowledge/ports';
import type { KnowledgeEmbeddingResult } from '../../knowledge/ports';
import { readEmbeddingDimensions, readEmbeddingVectors } from '../../knowledge/embedding-helpers';

export type OllamaKnowledgeEmbedderConfig = Readonly<{
  model: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: ProviderFetch;
}>;

export const DEFAULT_OLLAMA_EMBEDDING_BASE_URL = 'http://localhost:11434';

export class OllamaKnowledgeEmbedder implements KnowledgeEmbedderAPI {
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: ProviderFetch;

  constructor(config: OllamaKnowledgeEmbedderConfig) {
    this.model = normalizeProviderModel(config.model, 'Ollama knowledge embedding model');
    this.baseUrl = normalizeProviderBaseUrl(
      'Ollama knowledge embedding base URL',
      config.baseUrl ?? DEFAULT_OLLAMA_EMBEDDING_BASE_URL
    );
    this.timeoutMs = config.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
    this.fetchFn = config.fetch ?? ((url, init) => fetch(url, init));
  }

  async embedTexts(input: { texts: readonly string[] }): Promise<KnowledgeEmbeddingResult> {
    const payload = await postProviderJson({
      fetchFn: this.fetchFn,
      url: `${this.baseUrl}/api/embed`,
      body: {
        model: this.model,
        input: [...input.texts],
      },
      timeoutMs: this.timeoutMs,
      providerName: 'Ollama knowledge embedding',
    });

    if (!isRecord(payload)) {
      throw new Error('Ollama returned an unexpected knowledge embedding payload.');
    }

    const embeddings = readEmbeddingVectors(payload.embeddings, 'Ollama');

    return {
      model: typeof payload.model === 'string' ? payload.model : this.model,
      dimensions: readEmbeddingDimensions(embeddings),
      embeddings,
    };
  }
}
