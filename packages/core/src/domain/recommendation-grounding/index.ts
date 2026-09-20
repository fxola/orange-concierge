import type { KnowledgeSearchHit } from '../../ports/knowledge-retriever';
import type { EvidenceReference } from '../client-assessment-facts';
import type { RecommendationPriority } from '../recommendation';

export type RecommendationDraft = Readonly<{
  title: string;
  summary: string;
  priority: RecommendationPriority;
  clientEvidence: readonly string[];
  knowledgeSources: readonly string[];
}>;

export type GroundedRecommendation = Readonly<{
  id?: string;
  title: string;
  summary: string;
  priority: RecommendationPriority;
  clientEvidence: readonly EvidenceReference[];
  knowledgeCitations: readonly KnowledgeSearchHit[];
}>;

type GroundRecommendationsInput = Readonly<{
  drafts: readonly RecommendationDraft[];
  clientEvidence: readonly EvidenceReference[];
  knowledge: readonly KnowledgeSearchHit[];
}>;

export function citationsByFactPath(
  evidence: readonly EvidenceReference[]
): ReadonlyMap<string, EvidenceReference> {
  return new Map(evidence.map((reference) => [reference.factPath, reference]));
}

function citationsByChunkId(
  knowledge: readonly KnowledgeSearchHit[]
): ReadonlyMap<string, KnowledgeSearchHit> {
  return new Map(knowledge.map((hit) => [hit.chunkId, hit]));
}

export const MIN_EVIDENCE_QUOTE_LENGTH = 15;

const SCHEMA_KEY_TITLES = ['currentArrangement', 'assetsDiscussed', 'incidentHistory', 'nextSteps'];

function hasSchemaKeyTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return SCHEMA_KEY_TITLES.some((key) => lower.includes(key.toLowerCase()));
}

function hasContextFreeEvidence(evidence: readonly EvidenceReference[]): boolean {
  return evidence.some((entry) => entry.quote.trim().length < MIN_EVIDENCE_QUOTE_LENGTH);
}

function significantWords(value: string): readonly string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4);
}

function contradictsEvidence(title: string, evidence: readonly EvidenceReference[]): boolean {
  const titleLower = title.toLowerCase();
  if (!titleLower.includes('enable')) {
    return false;
  }

  const titleWords = new Set(significantWords(title));
  if (titleWords.size === 0) {
    return false;
  }

  return evidence.some((entry) => {
    const quoteLower = entry.quote.toLowerCase();
    if (!quoteLower.includes('disabled')) {
      return false;
    }

    return significantWords(entry.quote).some((word) => titleWords.has(word));
  });
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function groundRecommendations({
  drafts,
  clientEvidence,
  knowledge,
}: GroundRecommendationsInput): readonly GroundedRecommendation[] {
  const evidenceByFactPath = citationsByFactPath(clientEvidence);
  const knowledgeByChunkId = citationsByChunkId(knowledge);
  const seenTitles = new Set<string>();

  return drafts.flatMap((draft) => {
    if (hasSchemaKeyTitle(draft.title)) {
      return [];
    }

    const resolvedClientEvidence = draft.clientEvidence.flatMap((factPath) => {
      const reference = evidenceByFactPath.get(factPath);
      return reference ? [reference] : [];
    });
    const knowledgeCitations = draft.knowledgeSources.flatMap((chunkId) => {
      const hit = knowledgeByChunkId.get(chunkId);
      return hit ? [hit] : [];
    });

    if (resolvedClientEvidence.length === 0 || knowledgeCitations.length === 0) {
      return [];
    }

    if (hasContextFreeEvidence(resolvedClientEvidence)) {
      return [];
    }

    if (contradictsEvidence(draft.title, resolvedClientEvidence)) {
      return [];
    }

    const normalized = normalizeTitle(draft.title);
    if (seenTitles.has(normalized)) {
      return [];
    }
    seenTitles.add(normalized);

    return [
      {
        title: draft.title,
        summary: draft.summary,
        priority: draft.priority,
        clientEvidence: resolvedClientEvidence,
        knowledgeCitations,
      },
    ];
  });
}
