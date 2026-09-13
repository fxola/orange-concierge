import { ProviderError } from '../provider/provider-error';
import {
  DEFAULT_PROVIDER_TIMEOUT_MS,
  isRecord,
  normalizeProviderBaseUrl,
  normalizeProviderModel,
  postProviderJson,
} from '../provider/http';
import type {
  BaseProviderConfig,
  LLMProvider,
  LLMProviderFetch,
  StructuredGenerationRequest,
} from '../provider/llm-provider';

export { DEFAULT_PROVIDER_TIMEOUT_MS, isRecord } from '../provider/http';

export type BaseHttpAdapterConfig = BaseProviderConfig &
  Readonly<{
    defaultBaseUrl: string;
    providerName: string;
  }>;

/**
 * Shared HTTP workflow for provider adapters.
 *
 * Subclasses only describe their endpoint: path, request body, and how to
 * read the model text out of the payload. Timeout, transport failures, and
 * failure mapping live here so every adapter fails the same way.
 */
export abstract class BaseHttpAdapter implements LLMProvider {
  abstract readonly providerName: string;

  protected readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: LLMProviderFetch;

  protected constructor(config: BaseHttpAdapterConfig) {
    this.model = normalizeProviderModel(config.model, `${config.providerName} structured LLM model`);
    this.baseUrl = normalizeProviderBaseUrl(
      `${config.providerName} base URL`,
      config.baseUrl ?? config.defaultBaseUrl
    );
    this.timeoutMs = config.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
    this.fetchFn = config.fetch ?? ((url, init) => fetch(url, init));
  }

  async complete(input: StructuredGenerationRequest): Promise<string> {
    const payload = await postProviderJson({
      fetchFn: this.fetchFn,
      url: `${this.baseUrl}${this.path}`,
      headers: this.requestHeaders(),
      body: this.buildBody(input),
      timeoutMs: this.timeoutMs,
      providerName: this.providerName,
      createError: ({ kind, message, cause }) =>
        new ProviderError(kind, message, cause === undefined ? undefined : { cause }),
    });

    return this.readContent(payload);
  }

  protected abstract get path(): string;

  protected abstract buildBody(input: StructuredGenerationRequest): unknown;

  protected abstract readContent(payload: unknown): string;

  protected requestHeaders(): Record<string, string> {
    return {};
  }
}
