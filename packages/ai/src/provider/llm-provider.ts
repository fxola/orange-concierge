export type HTTPResponse = Pick<Response, 'ok' | 'json'>;

export type LLMProviderFetch = (url: string, init: RequestInit) => Promise<HTTPResponse>;

export type StructuredGenerationRequest = Readonly<{
  systemPrompt: string;
  userPrompt: string;
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
