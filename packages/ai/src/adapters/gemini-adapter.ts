import type {
  BaseProviderConfig,
  StructuredGenerationRequest,
} from '../provider/llm-provider';
import { ProviderError } from '../provider/provider-error';
import { BaseHttpAdapter, isRecord } from './base-adapter';

export type GeminiAdapterConfig = BaseProviderConfig &
  Readonly<{
    apiKey: string;
  }>;

export const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export class GeminiAdapter extends BaseHttpAdapter {
  readonly providerName = 'Gemini';

  private readonly apiKey: string;

  constructor(config: GeminiAdapterConfig) {
    if (config.apiKey.trim().length === 0) {
      throw new Error('Gemini structured LLM API key is required.');
    }

    super({ ...config, defaultBaseUrl: DEFAULT_GEMINI_BASE_URL, providerName: 'Gemini' });
    this.apiKey = config.apiKey;
  }

  protected get path(): string {
    const modelPath = this.model.startsWith('models/') ? this.model : `models/${this.model}`;
    return `/${modelPath}:generateContent`;
  }

  protected buildBody(input: StructuredGenerationRequest): unknown {
    return {
      systemInstruction: {
        parts: [{ text: input.systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: input.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    };
  }

  protected readContent(payload: unknown): string {
    if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
      throw new ProviderError('invalid_response', 'Gemini returned an unexpected payload.');
    }

    const [firstCandidate] = payload.candidates;
    if (!isRecord(firstCandidate) || !isRecord(firstCandidate.content)) {
      throw new ProviderError('invalid_response', 'Gemini returned an unexpected candidate.');
    }

    const parts = firstCandidate.content.parts;
    if (!Array.isArray(parts)) {
      throw new ProviderError('invalid_response', 'Gemini returned no content parts.');
    }

    const textPart = parts.find((part) => isRecord(part) && typeof part.text === 'string');
    if (!isRecord(textPart) || typeof textPart.text !== 'string') {
      throw new ProviderError('invalid_response', 'Gemini returned non-text content.');
    }

    return textPart.text;
  }

  protected requestHeaders(): Record<string, string> {
    return {
      'x-goog-api-key': this.apiKey,
    };
  }
}
