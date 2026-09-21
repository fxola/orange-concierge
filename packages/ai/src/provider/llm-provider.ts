import type { ProviderFetch, ProviderHttpResponse } from './http';

export type HTTPResponse = ProviderHttpResponse;

export type LLMProviderFetch = ProviderFetch;

export type StructuredGenerationRequest = Readonly<{
  systemPrompt: string;
  userPrompt: string;
  maxOutputTokens?: number;
  jsonSchema?: Readonly<Record<string, unknown>>;
}>;

export interface LLMProvider {
  readonly providerName: string;
  complete(input: StructuredGenerationRequest): Promise<string>;
}

export type BaseProviderConfig = Readonly<{
  model: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: LLMProviderFetch;
}>;
