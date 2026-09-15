import type { RecommendationDrafter, StructuredLLM } from '@orange-concierge/core';
import { GeminiAdapter, type GeminiAdapterConfig } from './adapters/gemini-adapter';
import { OllamaAdapter, type OllamaAdapterConfig } from './adapters/ollama-adapter';
import type { LLMProvider } from './provider/llm-provider';
import { AssessmentLLM } from './structured/assessment-llm';
import { RecommendationLLM } from './structured/recommendation-llm';

export type AIConfig =
  | (OllamaAdapterConfig & Readonly<{ provider: 'ollama' }>)
  | (GeminiAdapterConfig & Readonly<{ provider: 'gemini' }>);

function createLLMProvider(config: AIConfig): LLMProvider {
  if (config.provider === 'ollama') {
    const { provider: _provider, ...adapterConfig } = config;
    return new OllamaAdapter(adapterConfig);
  }

  if (config.provider === 'gemini') {
    const { provider: _provider, ...adapterConfig } = config;
    return new GeminiAdapter(adapterConfig);
  }

  throw new Error(
    `Unknown AI provider: ${JSON.stringify((config as { provider?: unknown }).provider)}.`
  );
}

export function createStructuredLLM(config: AIConfig): StructuredLLM {
  return new AssessmentLLM(createLLMProvider(config));
}

export function createRecommendationDrafter(config: AIConfig): RecommendationDrafter {
  return new RecommendationLLM(createLLMProvider(config));
}
