import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PatternSecretScanner } from '@orange-concierge/security';

import { indexKnowledgeCorpus } from '../src/knowledge/indexer.js';
import {
  InMemoryKnowledgeEmbedder,
  inMemoryKnowledgeIndexRepository,
} from '../src/adapters/knowledge/in-memory-adapters';

describe('indexKnowledgeCorpus', () => {
  it('reads the seeded Markdown corpus into stable chunks', async () => {
    const result = await indexKnowledgeCorpus({ dryRun: true });
    expect(result.isSuccess()).toBe(true);

    const indexed = result.getValue();

    expect(indexed.sourceCount).toBeGreaterThanOrEqual(8);
    expect(indexed.sourceCount).toBeLessThanOrEqual(15);
    expect(indexed.chunkCount).toBeGreaterThanOrEqual(indexed.sourceCount);
    expect(indexed.sources.map((source) => source.path)).toEqual([
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
    expect(indexed.chunks[0]).toMatchObject({
      id: 'knowledge/client-evidence-collection.md#0',
      sourceId: 'knowledge/client-evidence-collection.md',
      sourceTitle: 'Client Evidence Collection Standard',
      sourcePath: 'knowledge/client-evidence-collection.md',
      chunkIndex: 0,
    });
  });

  it('embeds and stores the indexed corpus when not in dry-run mode', async () => {
    const embedder = new InMemoryKnowledgeEmbedder();
    const store = new inMemoryKnowledgeIndexRepository();

    const result = await indexKnowledgeCorpus({ embedder, store });
    expect(result.isSuccess()).toBe(true);

    const indexed = result.getValue();

    expect(embedder.requests).toHaveLength(1);
    expect(embedder.requests[0]?.texts).toHaveLength(indexed.chunkCount);
    expect(store.replacements).toHaveLength(1);
    expect(store.replacements[0]?.sources).toHaveLength(indexed.sourceCount);
    expect(store.replacements[0]?.chunks[0]).toMatchObject({
      id: 'knowledge/client-evidence-collection.md#0',
      embedding: [0.01, 0.02, 0.03],
      embeddingModel: 'fake-embedding-model',
      embeddingDimensions: 3,
    });
  });

  it('blocks prohibited knowledge content before embeddings are created', async () => {
    const knowledgeDir = await mkdtemp(join(tmpdir(), 'orange-knowledge-'));
    await writeFile(
      join(knowledgeDir, 'unsafe.md'),
      '# Unsafe Source\n\n## Secret\n\napi key: abcdefghijklmnop',
      'utf8'
    );
    const embedder = new InMemoryKnowledgeEmbedder();

    const result = await indexKnowledgeCorpus({
      knowledgeDir,
      embedder,
      store: new inMemoryKnowledgeIndexRepository(),
      secretScanner: new PatternSecretScanner(),
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toMatchObject({
      reason: 'prohibited_secret',
      message: 'Knowledge source contains prohibited secret content: knowledge/unsafe.md',
      details: {
        sourcePath: 'knowledge/unsafe.md',
        findingCount: 1,
      },
    });
    expect(embedder.requests).toHaveLength(0);
  });
});
