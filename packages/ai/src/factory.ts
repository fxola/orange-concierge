import type { StructuredLLM } from '@orange-concierge/core';
import { GeminiAdapter, type GeminiAdapterConfig } from './adapters/gemini-adapter';
import { OllamaAdapter, type OllamaAdapterConfig } from './adapters/ollama-adapter';
import { AssessmentLLM } from './structured/assessment-llm';

export type AIConfig =
  | (OllamaAdapterConfig & Readonly<{ provider: 'ollama' }>)
  | (GeminiAdapterConfig & Readonly<{ provider: 'gemini' }>);

export function createStructuredLLM(config: AIConfig): StructuredLLM {
  if (config.provider === 'ollama') {
    const { provider: _provider, ...adapterConfig } = config;
    const ollamaAdapter = new OllamaAdapter(adapterConfig);
    return new AssessmentLLM(ollamaAdapter);
  }

  if (config.provider === 'gemini') {
    const { provider: _provider, ...adapterConfig } = config;
    const geminiAdapter = new GeminiAdapter(adapterConfig);
    return new AssessmentLLM(geminiAdapter);
  }

  throw new Error(
    `Unknown AI provider: ${JSON.stringify((config as { provider?: unknown }).provider)}.`
  );
}
