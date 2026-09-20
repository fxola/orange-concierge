import type {
  DraftRecommendation,
  ExtractedFacts,
  KnowledgeSearchHit,
  RecommendationDrafter,
  RecommendationDraftingFailureReason,
  RecommendationDraftingInput,
  RecommendationDraftingResult,
  ReadinessScore,
} from '@orange-concierge/core';
import { Result } from '@orange-concierge/core';
import type { LLMProvider } from '../provider/llm-provider';
import { ProviderError } from '../provider/provider-error';
import { isRecord, readRequiredString } from '../provider/http';

const RECOMMENDATION_SYSTEM_PROMPT = [
  'Draft evidence-backed recommendations for a Bitcoin client operations assessment.',
  'Return only a JSON object with a recommendations array.',
  'Each recommendation must contain title, summary, priority, clientEvidence, and knowledgeSources.',
  'priority must be one of: low, medium, high.',
  'Return at most two recommendations.',
  'Keep each title under 80 characters and each summary under 180 characters.',
  'Write each title as a single imperative action starting with a verb (for example "Confirm...", "Move...", or "Enable...").',
  'Write each summary as the reason in one short sentence that completes the title without repeating it, so title plus summary read as one merged "Do X because Y" statement.',
  'Never use internal schema field names in titles, such as currentArrangement, assetsDiscussed, incidentHistory, or nextSteps. Use natural operational language instead.',
  'Do not propose enabling a control that client evidence says is already disabled, such as proposing "Enable SMS recovery" when evidence says "SMS recovery is disabled".',
  'Only cite client evidence with clear context. Do not base recommendations on short ambiguous quotes under 15 characters.',
  'clientEvidence must contain exact factPath strings from the provided client evidence.',
  'knowledgeSources must contain exact chunkId strings from the retrieved knowledge.',
  'Use only the provided facts, readiness score, client evidence, and retrieved knowledge.',
  'Do not repeat the provided evidence quotes or knowledge excerpts in the summary.',
  'Do not include raw transcript text. Do not make policy claims without source support.',
  'If nothing is supported by both client evidence and knowledge, return {"recommendations":[]}.',
].join(' ');

const MAX_KNOWLEDGE_EXCERPT_CHARS = 520;
const RECOMMENDATION_MAX_OUTPUT_TOKENS = 520;

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function compactFacts(facts: ExtractedFacts): Omit<ExtractedFacts, 'evidence'> {
  const { evidence: _evidence, ...factGroups } = facts;
  return factGroups;
}

function compactReadinessScore(score: ReadinessScore) {
  return {
    overall: { score: score.overall.score, level: score.overall.level },
    custody: { score: score.custody.score, level: score.custody.level },
    cybersecurity: { score: score.cybersecurity.score, level: score.cybersecurity.level },
  };
}

function compactClientEvidence(input: RecommendationDraftingInput) {
  return input.clientEvidence.map((evidence) => ({
    factPath: evidence.factPath,
    quote: evidence.quote,
  }));
}

function compactKnowledge(knowledge: readonly KnowledgeSearchHit[]) {
  return knowledge.map((hit) => ({
    chunkId: hit.chunkId,
    sourceTitle: hit.sourceTitle,
    heading: hit.heading,
    excerpt:
      hit.content.length > MAX_KNOWLEDGE_EXCERPT_CHARS
        ? `${hit.content.slice(0, MAX_KNOWLEDGE_EXCERPT_CHARS)}...`
        : hit.content,
  }));
}

function buildRecommendationUserPrompt(input: RecommendationDraftingInput): string {
  return [
    `Interaction ID: ${input.interactionId}`,
    '',
    'Facts JSON:',
    formatJson(compactFacts(input.facts)),
    '',
    'Readiness JSON:',
    formatJson(compactReadinessScore(input.readinessScore)),
    '',
    'Client evidence JSON:',
    formatJson(compactClientEvidence(input)),
    '',
    'Retrieved knowledge JSON:',
    formatJson(compactKnowledge(input.knowledge)),
  ].join('\n');
}

function isPriority(value: unknown): value is DraftRecommendation['priority'] {
  return value === 'low' || value === 'medium' || value === 'high';
}

function readCitationArray(value: unknown, objectKey: 'factPath' | 'chunkId'): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const citations: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const citation = readRequiredString(item);
      if (!citation) {
        return null;
      }
      citations.push(citation);
      continue;
    }

    if (isRecord(item)) {
      const citation = readRequiredString(item[objectKey]);
      if (!citation) {
        return null;
      }
      citations.push(citation);
      continue;
    }

    return null;
  }

  return citations;
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
    const clientEvidence = readCitationArray(recommendation.clientEvidence, 'factPath');
    const knowledgeSources = readCitationArray(recommendation.knowledgeSources, 'chunkId');

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
        maxOutputTokens: RECOMMENDATION_MAX_OUTPUT_TOKENS,
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
