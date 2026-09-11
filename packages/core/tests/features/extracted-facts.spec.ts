import { describe, expect, it } from 'vitest';

import { parseExtractedFacts } from '../../src/application/interaction/extracted-facts';

describe('parseExtractedFacts', () => {
  it('drops blank strings and empty lists from model output', () => {
    const result = parseExtractedFacts({
      custody: { currentArrangement: 'multisig', assetsDiscussed: [], concerns: [] },
      cybersecurity: { controls: ['hardware wallets'], risks: [], incidentHistory: '' },
      planning: { goals: ['inheritance planning'], constraints: [], nextSteps: ['draft policy'] },
    });

    expect(result).toEqual({
      ok: true,
      facts: {
        custody: { currentArrangement: 'multisig' },
        cybersecurity: { controls: ['hardware wallets'] },
        planning: { goals: ['inheritance planning'], nextSteps: ['draft policy'] },
      },
    });
  });

  it('accepts an empty object as no facts', () => {
    expect(parseExtractedFacts({})).toEqual({ ok: true, facts: {} });
  });

  it('still rejects wrong field types', () => {
    expect(parseExtractedFacts({ custody: { currentArrangement: 42 } }).ok).toBe(false);
  });

  it('drops placeholder values echoed from shape examples', () => {
    const result = parseExtractedFacts({
      custody: {
        currentArrangement: 'string',
        assetsDiscussed: 'string',
        concerns: 'string',
      },
      cybersecurity: {
        controls: 'string',
        risks: 'string',
        incidentHistory: 'string',
      },
      planning: {
        goals: 'string',
        constraints: 'string',
        nextSteps: 'string',
      },
    });

    expect(result).toEqual({ ok: true, facts: {} });
  });

  it('wraps a bare string for list fields', () => {
    const result = parseExtractedFacts({
      custody: { concerns: 'losing a key' },
    });

    expect(result).toEqual({
      ok: true,
      facts: { custody: { concerns: ['losing a key'] } },
    });
  });
});
