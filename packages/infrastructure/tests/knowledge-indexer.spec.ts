import { describe, expect, it } from 'vitest';

import { indexKnowledgeCorpus } from '../src/knowledge/indexer';

describe('indexKnowledgeCorpus', () => {
  it('reads the seeded Markdown corpus into stable chunks', async () => {
    const result = await indexKnowledgeCorpus({ dryRun: true });

    expect(result.sourceCount).toBeGreaterThanOrEqual(8);
    expect(result.sourceCount).toBeLessThanOrEqual(15);
    expect(result.chunkCount).toBeGreaterThanOrEqual(result.sourceCount);
    expect(result.sources.map((source) => source.path)).toEqual([
      'knowledge/client-evidence-collection.md',
      'knowledge/exchange-withdrawal-review.md',
      'knowledge/hardware-wallet-handling.md',
      'knowledge/inheritance-planning.md',
      'knowledge/multisig-onboarding.md',
      'knowledge/phishing-sim-swap-response.md',
      'knowledge/recommendation-review-policy.md',
      'knowledge/seed-phrase-incident-response.md',
      'knowledge/self-custody-readiness.md',
      'knowledge/sovereign-operations-glossary.md',
    ]);
    expect(result.chunks[0]).toMatchObject({
      id: 'knowledge/client-evidence-collection.md#0',
      sourceId: 'knowledge/client-evidence-collection.md',
      sourceTitle: 'Client Evidence Collection Standard',
      sourcePath: 'knowledge/client-evidence-collection.md',
      chunkIndex: 0,
    });
  });
});
