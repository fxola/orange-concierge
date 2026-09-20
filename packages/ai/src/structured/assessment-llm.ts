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
  'Return only a JSON object. Copy words from the transcript; never invent facts.',
  'Do not wrap the object in a facts or data property.',
  'Omit any field you have no evidence for. Never use placeholder values.',
  'Groups (all optional):',
  'custody: currentArrangement (text), assetsDiscussed (list of texts), concerns (list of texts).',
  'cybersecurity: controls (list of texts), risks (list of texts), incidentHistory (text).',
  'planning: goals (list of texts), constraints (list of texts), nextSteps (list of texts).',
  'Security polarity: a disabled or removed weak recovery path is a control, not a risk.',
  'For example "SMS recovery is disabled" belongs in cybersecurity.controls.',
  'Only list "SMS recovery enabled", "SMS fallback still active", or "SIM recovery allowed" as a cybersecurity risk.',
  'incidentHistory is only for past security incidents that actually happened, such as a breach, hack, phishing compromise, theft, or unauthorized access.',
  'Do not use incidentHistory for policy statements, controls, or fragments like "disabled where providers permit it".',
  'Also return evidence: an array of { factPath, quote }.',
  'factPath uses group.field for text, like custody.currentArrangement, or group.field[index] for lists, like custody.concerns[0].',
  'quote must be an exact substring copied from the transcript, 1-500 chars.',
  'Prefer quotes that preserve polarity and context, for example "SMS recovery is disabled where providers permit it" instead of "SMS recovery".',
  'Give one evidence entry for each text fact and each list item you return.',
  'If the transcript has no relevant facts, return {}.',
].join(' ');

function buildAssessmentUserPrompt(input: StructuredLLMInput): string {
  return `Interaction ID: ${input.interactionId}\n\nTranscript:\n${input.transcript}`;
}

function parseAssessmentContent(content: string, transcript: string): ExtractAssessmentResult {
  let rawFacts: unknown;
  try {
    rawFacts = JSON.parse(content);
  } catch {
    return Result.failure<ExtractedFacts, ExtractAssessmentFailureReason>('invalid_response');
  }

  const parsedFacts = parseExtractedFacts(rawFacts, transcript);
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

    return parseAssessmentContent(content, input.transcript);
  }
}
