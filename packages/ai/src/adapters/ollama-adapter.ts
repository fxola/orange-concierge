import type {
  BaseProviderConfig,
  StructuredGenerationRequest,
} from '../provider/llm-provider';
import { ProviderError } from '../provider/provider-error';
import { BaseHttpAdapter, isRecord } from './base-adapter';

export type OllamaAdapterConfig = BaseProviderConfig;

export const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';

export class OllamaAdapter extends BaseHttpAdapter {
  readonly providerName = 'Ollama';

  constructor(config: OllamaAdapterConfig) {
    super({ ...config, defaultBaseUrl: DEFAULT_OLLAMA_BASE_URL, providerName: 'Ollama' });
  }

  protected get path(): string {
    return '/api/chat';
  }

  protected buildBody(input: StructuredGenerationRequest): unknown {
    return {
      model: this.model,
      stream: false,
      format: 'json',
      options: { temperature: 0 },
      messages: [
        { role: 'system', content: input.systemPrompt },
        { role: 'user', content: input.userPrompt },
      ],
    };
  }

  protected readContent(payload: unknown): string {
    if (
      !isRecord(payload) ||
      !isRecord(payload.message) ||
      typeof payload.message.content !== 'string'
    ) {
      throw new ProviderError('invalid_response', 'Ollama returned an unexpected payload.');
    }

    return payload.message.content;
  }
}
