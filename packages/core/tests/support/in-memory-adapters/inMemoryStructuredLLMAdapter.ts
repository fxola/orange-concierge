import type { StructuredLLM, StructuredLLMInput } from '../../../src/ports/structured-llm.js';

export class RecordingStructuredLLM implements StructuredLLM {
  inputs: StructuredLLMInput[] = [];
  private nextError: Error | undefined;

  constructor(private readonly operations: string[] = []) {}

  failNextExtraction(error = new Error('Structured LLM failed')): void {
    this.nextError = error;
  }

  async extractClientAssessment(input: StructuredLLMInput): Promise<unknown> {
    this.operations.push('llm');
    this.inputs.push(input);
    if (this.nextError) {
      throw this.nextError;
    }

    return { summary: 'Safe assessment placeholder' };
  }
}
