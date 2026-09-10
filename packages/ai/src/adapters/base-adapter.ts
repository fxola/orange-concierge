import { ProviderError } from '../provider/provider-error';
import type {
  BaseProviderConfig,
  LLMProvider,
  LLMProviderFetch,
  StructuredGenerationRequest,
} from '../provider/llm-provider';

export const DEFAULT_PROVIDER_TIMEOUT_MS = 30_000;

export function normalizeModel(model: string, providerName: string): string {
  const trimmed = model.trim();
  if (trimmed.length === 0) {
    throw new Error(`${providerName} structured LLM model is required.`);
  }
  return trimmed;
}

export function normalizeBaseUrl(name: string, value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not valid: "${value}".`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use http or https: "${value}".`);
  }

  return url.toString().replace(/\/+$/, '');
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export type PostJsonInput = Readonly<{
  fetchFn: LLMProviderFetch;
  url: string;
  headers?: Record<string, string>;
  body: unknown;
  timeoutMs: number;
  providerName: string;
}>;

export async function postJson(input: PostJsonInput): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await input.fetchFn(input.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...input.headers,
      },
      body: JSON.stringify(input.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ProviderError('request_failed', `${input.providerName} request failed.`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ProviderError('invalid_response', `${input.providerName} returned invalid JSON.`, {
        cause: error,
      });
    }
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    throw new ProviderError('request_failed', `${input.providerName} request failed.`, {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

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
    this.model = normalizeModel(config.model, config.providerName);
    this.baseUrl = normalizeBaseUrl(
      `${config.providerName} base URL`,
      config.baseUrl ?? config.defaultBaseUrl
    );
    this.timeoutMs = config.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
    this.fetchFn = config.fetch ?? ((url, init) => fetch(url, init));
  }

  async complete(input: StructuredGenerationRequest): Promise<string> {
    const payload = await postJson({
      fetchFn: this.fetchFn,
      url: `${this.baseUrl}${this.path}`,
      headers: this.requestHeaders(),
      body: this.buildBody(input),
      timeoutMs: this.timeoutMs,
      providerName: this.providerName,
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
