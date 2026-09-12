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

    const evidenceTemplates = [
      {
        factPath: 'custody.currentArrangement',
        quote: 'holding about 0.5 BTC on Coinbase',
      },
      {
        factPath: 'custody.concerns[0]',
        quote: 'wanting to move your bitcoin off the exchange',
      },
      {
        factPath: 'cybersecurity.controls[0]',
        quote: 'set up a hardware wallet',
      },
      {
        factPath: 'planning.goals[0]',
        quote: 'learn how to do self-custody properly',
      },
    ];

    const evidence = evidenceTemplates.flatMap((template) => {
      const startOffset = input.transcript.indexOf(template.quote);
      if (startOffset < 0) {
        return [];
      }
      return [
        {
          factPath: template.factPath,
          quote: template.quote,
          startOffset,
          endOffset: startOffset + template.quote.length,
        },
      ];
    });

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
      ...(evidence.length > 0 ? { evidence } : {}),
    });
  }
}
