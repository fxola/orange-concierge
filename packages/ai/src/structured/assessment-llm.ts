import {
  assessmentModelOutputJsonSchema,
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

const ASSESSMENT_SYSTEM_PROMPT = `
You extract assessment facts from a client transcript.

GENERAL RULES

1. Extract only information explicitly supported by the transcript.
2. Never invent, infer, or complete missing information.
3. Copy fact text from the transcript whenever possible.
4. Omit fields for which there is no supporting evidence.
5. Do not use placeholders such as "unknown", "none", "n/a", or empty strings.
6. Return JSON matching the provided response schema.
7. Every fact must be an object with text and quote.
8. quote must be an exact substring copied from the transcript.

CLASSIFICATION RULES

custody.currentArrangement
The client's current custody or asset-holding arrangement.
This must describe the present custody setup, not a yes/no answer, not a question,
and not the consultant's wording of what they are asking.

custody.assetsDiscussed
Specific assets discussed by the client.
Seed phrases, recovery phrases, passwords, private keys, PINs, and hardware wallets are not assets. Hardware wallets can describe custody arrangement, not assets.

custody.concerns
Problems, worries, weaknesses, or concerns related to custody.
Only include explicit worries or problems.

cybersecurity.controls
Security protections that are enabled or security weaknesses that have been disabled or removed.

Examples:
- "SMS recovery is disabled" is a control.
- A removed fallback recovery mechanism is a control.

cybersecurity.risks
Security weaknesses or exposed recovery mechanisms that are currently enabled or available.

Examples:
- "SMS recovery enabled" is a risk.
- "SMS fallback still active" is a risk.
- "SIM recovery allowed" is a risk.

Never classify the same statement as both a control and a risk.

cybersecurity.incidentHistory
Only security incidents that actually happened in the past.

Examples include:
- breach
- hack
- phishing compromise
- theft
- unauthorized access

Do not classify plans, future actions, hypothetical situations, security policies,
controls, risks, or recommendations as incidentHistory.

planning.goals
Desired outcomes or options the client explicitly wants to achieve or is considering.
A contemplated action may be a goal when the client is exploring it but has not committed to doing it.

planning.nextSteps
Only actions the client has explicitly decided, agreed, or committed to take.

Do NOT treat:
- "I'm thinking of..."
- "I'm considering..."
- "Would it make sense to..."
as a nextStep.

planning.constraints
Limitations or restrictions affecting those goals.

EVIDENCE RULES

Each fact object has:
- text: the extracted fact summarized from the transcript
- quote: the exact transcript substring that supports that fact

The quote must preserve important context and polarity and be between 1 and 500 characters.

For example, prefer:
"SMS recovery is disabled where providers permit it"

instead of:
"SMS recovery"

If no relevant facts exist, return {}.
`.trim();

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
        jsonSchema: assessmentModelOutputJsonSchema,
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
