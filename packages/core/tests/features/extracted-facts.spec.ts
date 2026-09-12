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

  it('rejects unrelated JSON objects instead of treating them as no facts', () => {
    expect(parseExtractedFacts({ error: 'model returned an error' })).toEqual({ ok: false });
  });

  it('rejects wrapped fact payloads instead of silently completing empty', () => {
    expect(
      parseExtractedFacts({ facts: { custody: { currentArrangement: 'multisig' } } })
    ).toEqual({ ok: false });
  });

  it('drops empty fact groups after validation', () => {
    expect(parseExtractedFacts({ custody: {}, planning: { goals: [] } })).toEqual({
      ok: true,
      facts: {},
    });
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

  it('resolves evidence offsets from exact transcript quotes', () => {
    const transcript = 'Client holds 0.5 BTC on Coinbase and worries about exchange risk.';
    const result = parseExtractedFacts(
      {
        custody: {
          currentArrangement: 'Client holds bitcoin on Coinbase.',
          concerns: ['Exchange risk'],
        },
        evidence: [
          { factPath: 'custody.currentArrangement', quote: '0.5 BTC on Coinbase' },
          { factPath: 'custody.concerns[0]', quote: 'exchange risk' },
        ],
      },
      transcript
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.facts.evidence).toHaveLength(2);
    expect(result.facts.evidence?.[0]).toEqual({
      factPath: 'custody.currentArrangement',
      quote: '0.5 BTC on Coinbase',
      startOffset: transcript.indexOf('0.5 BTC on Coinbase'),
      endOffset: transcript.indexOf('0.5 BTC on Coinbase') + '0.5 BTC on Coinbase'.length,
    });
  });

  it('keeps facts but drops evidence quotes missing from the transcript', () => {
    const result = parseExtractedFacts(
      {
        custody: { currentArrangement: 'multisig' },
        evidence: [{ factPath: 'custody.currentArrangement', quote: 'not in transcript' }],
      },
      'Client uses multisig.'
    );

    expect(result).toEqual({
      ok: true,
      facts: { custody: { currentArrangement: 'multisig' } },
    });
  });

  it('rejects non-array evidence payloads', () => {
    expect(
      parseExtractedFacts(
        {
          custody: { currentArrangement: 'multisig' },
          evidence: '0.5 BTC on Coinbase',
        },
        'Client holds 0.5 BTC on Coinbase.'
      ).ok
    ).toBe(false);
  });

  it('drops evidence with unknown fact paths', () => {
    const result = parseExtractedFacts(
      {
        custody: { currentArrangement: 'multisig' },
        evidence: [{ factPath: 'custody.unknownField', quote: 'multisig' }],
      },
      'Client uses multisig.'
    );

    expect(result).toEqual({
      ok: true,
      facts: { custody: { currentArrangement: 'multisig' } },
    });
  });
});
