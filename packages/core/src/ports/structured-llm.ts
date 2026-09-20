import type { ExtractedFacts } from '../domain/client-assessment-facts';
import type { Result } from '../application/result';

export type StructuredLLMInput = Readonly<{
  interactionId: string;
  transcript: string;
}>;

export type ExtractAssessmentFailureReason = 'request_failed' | 'invalid_response';

export type ExtractAssessmentResult = Result<ExtractedFacts, ExtractAssessmentFailureReason>;

export interface StructuredLLM {
  extractClientAssessment(input: StructuredLLMInput): Promise<ExtractAssessmentResult>;
}
