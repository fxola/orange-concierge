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
import {
  parseRecommendationModelOutput,
  recommendationModelOutputJsonSchema,
  Result,
} from '@orange-concierge/core';
import type { LLMProvider } from '../provider/llm-provider';
import { ProviderError } from '../provider/provider-error';

const RECOMMENDATION_SYSTEM_PROMPT = `
You draft evidence-backed recommendations for a Bitcoin client operations assessment.

GENERAL RULES

1. Use only the provided facts, readiness score, client evidence, and retrieved knowledge.
2. Never invent facts, evidence, or knowledge sources.
3. Return JSON matching the provided response schema.
4. Return an object with a recommendations array, at most 2 items.
5. Each recommendation must be an object with title, summary, priority, clientEvidence, and knowledgeSources.
6. Omit recommendations with no supporting evidence on both sides - if nothing is supported by both client evidence and knowledge, return {"recommendations":[]}.
7. Do not include raw transcript text. Do not make policy claims without source support.

FORMAT RULES

- title: single imperative action starting with a verb (e.g. "Confirm...", "Move...", "Enable..."), 1-80 characters, one line.
- summary: the reason in one short sentence that completes the title without repeating it, so title plus summary read as "Do X because Y", 1-180 characters.
- priority: exactly one of low, medium, high.
- clientEvidence: array of factPath strings only (e.g. "custody.concerns[0]"). No objects.
- knowledgeSources: array of chunkId strings only. No objects.
- Do not repeat evidence quotes or knowledge excerpts in title or summary.

CITATION RULES

- clientEvidence must contain exact factPath strings copied from the provided client evidence. Never invent a factPath.
- knowledgeSources must contain exact chunkId strings copied from the retrieved knowledge. Never invent a chunkId.
- Every recommendation must cite at least one clientEvidence and at least one knowledgeSource.
- Only cite client evidence with clear context. Do not base recommendations on short ambiguous quotes under 15 characters.
- Do not cite the same factPath twice in one recommendation. Do not repeat the same title twice (case/whitespace-insensitive).

TITLE RULES

- Never use internal schema field names in titles, such as currentArrangement, assetsDiscussed, incidentHistory, or nextSteps. Use natural operational language instead.
- Do not propose enabling a control that client evidence says is already disabled, such as proposing "Enable SMS recovery" when evidence says "SMS recovery is disabled".
`.trim();

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

function parseRecommendationContent(content: string): RecommendationDraftingResult {
  let rawResponse: unknown;
  try {
    rawResponse = JSON.parse(content);
  } catch {
    return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
      'invalid_response'
    );
  }

  const parsedResponse = parseRecommendationModelOutput(rawResponse);
  if (!parsedResponse.ok) {
    return Result.failure<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
      'invalid_response'
    );
  }

  return Result.success<readonly DraftRecommendation[], RecommendationDraftingFailureReason>(
    parsedResponse.drafts
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
        jsonSchema: recommendationModelOutputJsonSchema,
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
