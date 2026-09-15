import type { KnowledgeSearchHit } from '../../ports/knowledge-retriever';
import type { DraftRecommendation } from '../../ports/recommendation-drafter';
import type { EvidenceReference } from '../interaction/extracted-facts';
import type { GroundedRecommendation } from './types';

type GroundRecommendationsInput = Readonly<{
  drafts: readonly DraftRecommendation[];
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

export function groundRecommendations({
  drafts,
  clientEvidence,
  knowledge,
}: GroundRecommendationsInput): readonly GroundedRecommendation[] {
  const evidenceByFactPath = citationsByFactPath(clientEvidence);
  const knowledgeByChunkId = citationsByChunkId(knowledge);

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
