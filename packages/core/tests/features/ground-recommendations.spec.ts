import { describe, expect, it } from 'vitest';

import { groundRecommendations } from '../../src/application/recommendation/ground-recommendations';
import type { EvidenceReference } from '../../src/application/interaction/extracted-facts';
import type { KnowledgeSearchHit } from '../../src/ports/knowledge-retriever';

const knowledgeHit: KnowledgeSearchHit = {
  chunkId: 'knowledge/exchange-withdrawal-review.md#1',
  sourceId: 'knowledge/exchange-withdrawal-review.md',
  sourceTitle: 'Exchange Withdrawal Review',
  sourcePath: 'knowledge/exchange-withdrawal-review.md',
  heading: 'Recovery controls',
  content: 'Prefer hardware-backed recovery controls over SMS fallback.',
  score: 0.9,
};

function evidence(factPath: string, quote: string): EvidenceReference {
  return {
    factPath,
    quote,
    startOffset: 0,
    endOffset: quote.length,
  };
}

describe('groundRecommendations quality gates', () => {
  it('rejects Enable SMS recovery when evidence says SMS recovery is disabled', () => {
    const result = groundRecommendations({
      drafts: [
        {
          title: 'Enable SMS recovery',
          summary: 'Allow quick withdrawals after market stress.',
          priority: 'high',
          clientEvidence: ['cybersecurity.risks[0]'],
          knowledgeSources: [knowledgeHit.chunkId],
        },
      ],
      clientEvidence: [
        evidence('cybersecurity.risks[0]', 'SMS recovery is disabled where providers permit it'),
      ],
      knowledge: [knowledgeHit],
    });

    expect(result).toEqual([]);
  });

  it('rejects recommendations based on context-free short evidence', () => {
    const result = groundRecommendations({
      drafts: [
        {
          title: 'Enable SMS recovery',
          summary: 'Allow quick withdrawals.',
          priority: 'high',
          clientEvidence: ['cybersecurity.risks[0]'],
          knowledgeSources: [knowledgeHit.chunkId],
        },
      ],
      clientEvidence: [evidence('cybersecurity.risks[0]', 'SMS recovery')],
      knowledge: [knowledgeHit],
    });

    expect(result).toEqual([]);
  });

  it('rejects schema-key titles like Confirm currentArrangement', () => {
    const result = groundRecommendations({
      drafts: [
        {
          title: 'Confirm currentArrangement',
          summary: 'Confirm the documented custody arrangement with approvers.',
          priority: 'medium',
          clientEvidence: ['custody.currentArrangement'],
          knowledgeSources: [knowledgeHit.chunkId],
        },
      ],
      clientEvidence: [
        evidence(
          'custody.currentArrangement',
          'Client uses a two-of-three multisignature wallet for long-term holdings'
        ),
      ],
      knowledge: [knowledgeHit],
    });

    expect(result).toEqual([]);
  });

  it('deduplicates recommendations with the same title', () => {
    const clientEvidence = [
      evidence(
        'custody.currentArrangement',
        'Client uses a two-of-three multisignature wallet for long-term holdings'
      ),
    ];

    const result = groundRecommendations({
      drafts: [
        {
          title: 'Run quarterly recovery drill',
          summary: 'Practice recovery because no drill has run yet.',
          priority: 'high',
          clientEvidence: ['custody.currentArrangement'],
          knowledgeSources: [knowledgeHit.chunkId],
        },
        {
          title: 'Run Quarterly Recovery Drill',
          summary: 'Practice recovery because no drill has run yet.',
          priority: 'high',
          clientEvidence: ['custody.currentArrangement'],
          knowledgeSources: [knowledgeHit.chunkId],
        },
      ],
      clientEvidence,
      knowledge: [knowledgeHit],
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe('Run quarterly recovery drill');
  });

  it('keeps well-grounded recommendations with contextual evidence', () => {
    const result = groundRecommendations({
      drafts: [
        {
          title: 'Run quarterly recovery drill',
          summary: 'Practice recovery because the client has not run a drill yet.',
          priority: 'high',
          clientEvidence: ['planning.nextSteps[0]'],
          knowledgeSources: [knowledgeHit.chunkId],
        },
      ],
      clientEvidence: [
        evidence(
          'planning.nextSteps[0]',
          'The client has not run a quarterly recovery drill yet'
        ),
      ],
      knowledge: [knowledgeHit],
    });

    expect(result).toHaveLength(1);
  });
});
