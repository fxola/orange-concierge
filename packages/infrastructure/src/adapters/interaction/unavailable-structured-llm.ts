import type { StructuredLLM, StructuredLLMInput } from '@orange-concierge/core';

export class UnavailableStructuredLLM implements StructuredLLM {
  async extractClientAssessment(_input: StructuredLLMInput): Promise<unknown> {
    throw new Error('Structured LLM is not configured');
  }
}
