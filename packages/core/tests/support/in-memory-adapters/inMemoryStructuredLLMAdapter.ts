import { Result, type ExtractedFacts } from '../../../src';
import type {
  ExtractAssessmentFailureReason,
  ExtractAssessmentResult,
  StructuredLLM,
  StructuredLLMInput,
} from '../../../src/ports/structured-llm.js';

export class RecordingStructuredLLM implements StructuredLLM {
  inputs: StructuredLLMInput[] = [];
  private nextFailure: ExtractAssessmentFailureReason | undefined;

  constructor(private readonly operations: string[] = []) {}

  failNextExtraction(reason: ExtractAssessmentFailureReason = 'request_failed'): void {
    this.nextFailure = reason;
  }

  async extractClientAssessment(input: StructuredLLMInput): Promise<ExtractAssessmentResult> {
    this.operations.push('llm');
    this.inputs.push(input);

    if (this.nextFailure) {
      const reason = this.nextFailure;
      this.nextFailure = undefined;
      return Result.failure<ExtractedFacts, ExtractAssessmentFailureReason>(reason);
    }

    return Result.success<ExtractedFacts, ExtractAssessmentFailureReason>({
      custody: {
        currentArrangement: 'Client holds bitcoin on Coinbase.',
        concerns: ['Wants to move funds off exchange'],
      },
      cybersecurity: {
        controls: ['Uses hardware wallet'],
      },
      planning: {
        goals: ['Learn safe self-custody'],
      },
    });
  }
}
