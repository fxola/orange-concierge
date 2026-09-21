import type { KnowledgeSearchHit } from '../../ports/knowledge-retriever';
import type { EvidenceReference } from '../client-assessment-facts';
import type { RecommendationPriority } from '.';

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
