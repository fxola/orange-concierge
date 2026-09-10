import {
  parseExtractedFacts,
  Result,
  type ExtractAssessmentFailureReason,
  type ExtractAssessmentResult,
  type ExtractedFacts,
  type StructuredLLM,
  type StructuredLLMInput,
} from '@orange-concierge/core';
import type { LLMProvider } from '../provider/llm-provider';
import { ProviderError } from '../provider/provider-error';

const ASSESSMENT_SYSTEM_PROMPT = [
  'Extract client assessment facts from the transcript.',
  'Return only valid JSON matching this shape:',
  '{"custody":{"currentArrangement":"string","assetsDiscussed":["string"],"concerns":["string"]},"cybersecurity":{"controls":["string"],"risks":["string"],"incidentHistory":"string"},"planning":{"goals":["string"],"constraints":["string"],"nextSteps":["string"]}}',
  'All groups and fields are optional. Do not invent facts that are not present.',
].join(' ');

function buildAssessmentUserPrompt(input: StructuredLLMInput): string {
  return `Interaction ID: ${input.interactionId}\n\nTranscript:\n${input.transcript}`;
}

function parseAssessmentContent(content: string): ExtractAssessmentResult {
  let rawFacts: unknown;
  try {
    rawFacts = JSON.parse(content);
  } catch {
    return Result.failure<ExtractedFacts, ExtractAssessmentFailureReason>('invalid_response');
  }

  const parsedFacts = parseExtractedFacts(rawFacts);
  if (!parsedFacts.ok) {
    return Result.failure<ExtractedFacts, ExtractAssessmentFailureReason>('invalid_response');
  }

  return Result.success<ExtractedFacts, ExtractAssessmentFailureReason>(parsedFacts.facts);
}

export class AssessmentLLM implements StructuredLLM {
  constructor(private readonly provider: LLMProvider) {}

  async extractClientAssessment(input: StructuredLLMInput): Promise<ExtractAssessmentResult> {
    let content: string;
    try {
      content = await this.provider.complete({
        systemPrompt: ASSESSMENT_SYSTEM_PROMPT,
        userPrompt: buildAssessmentUserPrompt(input),
      });
    } catch (error) {
      if (error instanceof ProviderError) {
        return Result.failure<ExtractedFacts, ExtractAssessmentFailureReason>(error.kind);
      }
      return Result.failure<ExtractedFacts, ExtractAssessmentFailureReason>('request_failed');
    }

    return parseAssessmentContent(content);
  }
}
