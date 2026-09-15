import type {
  DraftRecommendation,
  RecommendationDrafter,
  RecommendationDraftingFailureReason,
  RecommendationDraftingInput,
  RecommendationDraftingResult,
} from '@orange-concierge/core';
import { Result } from '@orange-concierge/core';
import type { LLMProvider } from '../provider/llm-provider';
import { ProviderError } from '../provider/provider-error';
import { isRecord, readRequiredString, readStringArray } from '../provider/http';

const RECOMMENDATION_SYSTEM_PROMPT = [
  'Draft evidence-backed recommendations for a Bitcoin client operations assessment.',
  'Return only a JSON object with a recommendations array.',
  'Each recommendation must contain title, summary, priority, clientEvidence, and knowledgeSources.',
  'priority must be one of: low, medium, high.',
  'clientEvidence must contain exact factPath strings from the provided client evidence.',
  'knowledgeSources must contain exact chunkId strings from the retrieved knowledge.',
  'Use only the provided facts, readiness score, client evidence, and retrieved knowledge.',
  'Do not include raw transcript text. Do not make policy claims without source support.',
].join(' ');

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function buildRecommendationUserPrompt(input: RecommendationDraftingInput): string {
  return [
    `Interaction ID: ${input.interactionId}`,
    '',
    'Facts JSON:',
    formatJson(input.facts),
    '',
    'Readiness JSON:',
    formatJson(input.readinessScore),
    '',
    'Client evidence JSON:',
    formatJson(input.clientEvidence),
    '',
    'Retrieved knowledge JSON:',
    formatJson(input.knowledge),
  ].join('\n');
}

function isPriority(value: unknown): value is DraftRecommendation['priority'] {
  return value === 'low' || value === 'medium' || value === 'high';
}

function parseRecommendationContent(content: string): RecommendationDraftingResult {
  let rawResponse: unknown;
  try {
    rawResponse = JSON.parse(content);
  } catch {
    return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
      'invalid_response'
    );
  }

  if (!isRecord(rawResponse) || !Array.isArray(rawResponse.recommendations)) {
    return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
      'invalid_response'
    );
  }

  const drafts: DraftRecommendation[] = [];
  for (const recommendation of rawResponse.recommendations) {
    if (!isRecord(recommendation)) {
      return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
        'invalid_response'
      );
    }

    const title = readRequiredString(recommendation.title);
    const summary = readRequiredString(recommendation.summary);
    const clientEvidence = readStringArray(recommendation.clientEvidence);
    const knowledgeSources = readStringArray(recommendation.knowledgeSources);

    if (
      !title ||
      !summary ||
      !isPriority(recommendation.priority) ||
      !clientEvidence ||
      !knowledgeSources
    ) {
      return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
        'invalid_response'
      );
    }

    drafts.push({
      title,
      summary,
      priority: recommendation.priority,
      clientEvidence,
      knowledgeSources,
    });
  }

  return Result.success<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
    drafts
  );
}

export class RecommendationLLM implements RecommendationDrafter {
  constructor(private readonly provider: LLMProvider) {}

  async draftRecommendations(
    input: RecommendationDraftingInput
  ): Promise<RecommendationDraftingResult> {
    let content: string;
    try {
      content = await this.provider.complete({
        systemPrompt: RECOMMENDATION_SYSTEM_PROMPT,
        userPrompt: buildRecommendationUserPrompt(input),
      });
    } catch (error) {
      if (error instanceof ProviderError) {
        return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
          error.kind
        );
      }
      return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
        'request_failed'
      );
    }

    return parseRecommendationContent(content);
  }
}
