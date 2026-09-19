import { describe, expect, it } from 'vitest';

import {
  calculateEvidenceCoverage,
  factPathsFor,
  parseExtractedFacts,
} from '../../src/application/interaction/extracted-facts';

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
    expect(parseExtractedFacts({ facts: { custody: { currentArrangement: 'multisig' } } })).toEqual(
      { ok: false }
    );
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

  it('treats disabled SMS recovery as a control, not a risk or incident', () => {
    const transcript =
      'UX-AUDIT-2026-09-19-1320 Client asked whether their treasury policy is ready for a larger bitcoin allocation. Exchange and email accounts use hardware security keys, SMS recovery is disabled where providers permit it, and generated passwords are stored in a password manager.';

    const result = parseExtractedFacts(
      {
        cybersecurity: {
          controls: ['Uses hardware security keys'],
          risks: ['SMS recovery'],
          incidentHistory: 'disabled where providers permit it',
        },
      },
      transcript
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.facts.cybersecurity?.risks ?? []).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/sms recovery/i)])
    );
    expect(result.facts.cybersecurity?.controls ?? []).toEqual(
      expect.arrayContaining([expect.stringMatching(/sms recovery is disabled/i)])
    );
    expect(result.facts.cybersecurity?.incidentHistory).toBeUndefined();
  });

  it('drops policy fragments from incident history without incident keywords', () => {
    const result = parseExtractedFacts(
      {
        cybersecurity: {
          controls: ['Hardware keys'],
          incidentHistory: 'disabled where providers permit it',
        },
      },
      'Exchange accounts use hardware keys, SMS recovery is disabled where providers permit it.'
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.facts.cybersecurity?.incidentHistory).toBeUndefined();
    expect(result.facts.cybersecurity?.controls).toEqual([
      'Hardware keys',
      expect.stringMatching(/sms recovery is disabled/i),
    ]);
  });
});

describe('calculateEvidenceCoverage', () => {
  it('marks 1/12 coverage as low confidence', () => {
    const coverage = calculateEvidenceCoverage({
      custody: {
        currentArrangement: 'multisig',
        assetsDiscussed: ['BTC', 'treasury'],
        concerns: ['allocation', 'readiness', 'board'],
      },
      cybersecurity: {
        controls: ['hardware keys', 'password manager'],
        risks: ['no drill'],
        incidentHistory: 'none yet',
      },
      planning: {
        goals: ['larger allocation'],
        constraints: ['board meeting'],
      },
      evidence: [
        {
          factPath: 'custody.currentArrangement',
          quote: 'multisig',
          startOffset: 0,
          endOffset: 8,
        },
      ],
    });

    expect(coverage.total).toBe(12);
    expect(coverage.sourced).toBe(1);
    expect(coverage.isLowConfidence).toBe(true);
  });

  it('enumerates every addressable fact path', () => {
    expect(
      factPathsFor({
        custody: { currentArrangement: 'multisig', concerns: ['a', 'b'] },
        cybersecurity: { controls: ['keys'], incidentHistory: 'breach in 2024' },
        planning: { nextSteps: ['drill'] },
      })
    ).toEqual([
      'custody.currentArrangement',
      'custody.concerns[0]',
      'custody.concerns[1]',
      'cybersecurity.controls[0]',
      'cybersecurity.incidentHistory',
      'planning.nextSteps[0]',
    ]);
  });

  it('counts human-verified facts toward coverage', () => {
    const facts = {
      custody: { currentArrangement: 'multisig' },
      cybersecurity: { controls: ['hardware keys'], risks: ['no drill'] },
      evidence: [
        {
          factPath: 'cybersecurity.controls[0]',
          quote: 'hardware keys',
          startOffset: 0,
          endOffset: 13,
        },
      ],
    };

    const before = calculateEvidenceCoverage(facts);
    expect(before.total).toBe(3);
    expect(before.sourced).toBe(1);
    expect(before.isLowConfidence).toBe(true);

    const after = calculateEvidenceCoverage(facts, ['custody.currentArrangement']);
    expect(after.sourced).toBe(2);
    expect(after.ratio).toBeCloseTo(2 / 3);
    expect(after.isLowConfidence).toBe(false);
  });

  it('ignores unknown or already-evidenced verified paths', () => {
    const facts = {
      custody: { currentArrangement: 'multisig' },
      evidence: [
        {
          factPath: 'custody.currentArrangement',
          quote: 'multisig',
          startOffset: 0,
          endOffset: 8,
        },
      ],
    };

    const coverage = calculateEvidenceCoverage(facts, [
      'custody.currentArrangement',
      'custody.madeUp',
      'custody.currentArrangement',
    ]);
    expect(coverage.total).toBe(1);
    expect(coverage.sourced).toBe(1);
  });

  it('marks fully sourced facts as confident', () => {
    const coverage = calculateEvidenceCoverage({
      custody: { currentArrangement: 'multisig' },
      evidence: [
        {
          factPath: 'custody.currentArrangement',
          quote: 'multisig',
          startOffset: 0,
          endOffset: 8,
        },
      ],
    });

    expect(coverage.total).toBe(1);
    expect(coverage.sourced).toBe(1);
    expect(coverage.isLowConfidence).toBe(false);
  });
});
