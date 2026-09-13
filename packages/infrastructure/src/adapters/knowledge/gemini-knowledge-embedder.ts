import {
  DEFAULT_PROVIDER_TIMEOUT_MS,
  isRecord,
  normalizeProviderBaseUrl,
  normalizeProviderModel,
  postProviderJson,
  type ProviderFetch,
} from '@orange-concierge/ai';
import type { KnowledgeEmbedderAPI, KnowledgeEmbeddingResult } from '../../knowledge/ports';
import { readEmbeddingDimensions, readEmbeddingVectors } from '../../knowledge/embedding-helpers';

export type GeminiKnowledgeEmbedderConfig = Readonly<{
  apiKey: string;
  model: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: ProviderFetch;
}>;

export const DEFAULT_GEMINI_EMBEDDING_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GeminiKnowledgeEmbedder implements KnowledgeEmbedderAPI {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly modelPath: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: ProviderFetch;

  constructor(config: GeminiKnowledgeEmbedderConfig) {
    const apiKey = config.apiKey.trim();
    if (apiKey.length === 0) {
      throw new Error('Gemini knowledge embedding API key is required.');
    }

    this.apiKey = apiKey;
    this.model = normalizeProviderModel(config.model, 'Gemini knowledge embedding model');
    this.modelPath = this.model.startsWith('models/') ? this.model : `models/${this.model}`;
    this.baseUrl = normalizeProviderBaseUrl(
      'Gemini knowledge embedding base URL',
      config.baseUrl ?? DEFAULT_GEMINI_EMBEDDING_BASE_URL
    );
    this.timeoutMs = config.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
    this.fetchFn = config.fetch ?? ((url, init) => fetch(url, init));
  }

  async embedTexts(input: { texts: readonly string[] }): Promise<KnowledgeEmbeddingResult> {
    const payload = await postProviderJson({
      fetchFn: this.fetchFn,
      url: `${this.baseUrl}/${this.modelPath}:batchEmbedContents`,
      headers: {
        'x-goog-api-key': this.apiKey,
      },
      body: {
        requests: input.texts.map((text) => ({
          model: this.modelPath,
          content: { parts: [{ text }] },
        })),
      },
      timeoutMs: this.timeoutMs,
      providerName: 'Gemini knowledge embedding',
    });

    if (!isRecord(payload) || !Array.isArray(payload.embeddings)) {
      throw new Error('Gemini returned an unexpected knowledge embedding payload.');
    }

    const embeddings = readEmbeddingVectors(
      payload.embeddings.map((embedding) => {
        if (!isRecord(embedding)) {
          throw new Error('Gemini returned a non-object embedding.');
        }

        return embedding.values;
      }),
      'Gemini'
    );

    return {
      model: this.model,
      dimensions: readEmbeddingDimensions(embeddings),
      embeddings,
    };
  }
}
