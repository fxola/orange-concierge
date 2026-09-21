import { describe, expect, it } from 'vitest';

import {
  calculateEvidenceCoverage,
  factPathsFor,
  parseExtractedFacts,
} from '../../src/domain/client-assessment-facts';

describe('parseExtractedFacts', () => {
  const fact = (text: string, quote = text) => ({ text, quote });

  it('accepts an empty object as no facts', () => {
    expect(parseExtractedFacts({})).toEqual({ ok: true, facts: {} });
  });

  it('drops empty lists and empty fact groups', () => {
    expect(parseExtractedFacts({ custody: { assetsDiscussed: [], concerns: [] } })).toEqual({
      ok: true,
      facts: {},
    });
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

  it('drops placeholder values echoed from shape examples', () => {
    const result = parseExtractedFacts(
      { custody: { currentArrangement: fact('string') } },
      'string'
    );

    expect(result).toEqual({ ok: true, facts: {} });
  });

  it('rejects bare strings for list fields', () => {
    const result = parseExtractedFacts({
      custody: { concerns: 'losing a key' },
    });

    expect(result.ok).toBe(false);
  });

  it('maps model facts to extracted facts with generated paths and offsets', () => {
    const transcript =
      'Client holds bitcoin on a hardware wallet and worries about losing the seed phrase.';
    const result = parseExtractedFacts(
      {
        custody: {
          currentArrangement: fact('Client holds bitcoin on a hardware wallet'),
          assetsDiscussed: [fact('bitcoin')],
          concerns: [fact('worries about losing the seed phrase')],
        },
      },
      transcript
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.facts.custody).toEqual({
      currentArrangement: 'Client holds bitcoin on a hardware wallet',
      assetsDiscussed: ['bitcoin'],
      concerns: ['worries about losing the seed phrase'],
    });
    expect(result.facts.evidence?.map((entry) => entry.factPath)).toEqual([
      'custody.currentArrangement',
      'custody.assetsDiscussed[0]',
      'custody.concerns[0]',
    ]);
    expect(result.facts.evidence?.[0]).toEqual({
      factPath: 'custody.currentArrangement',
      quote: 'Client holds bitcoin on a hardware wallet',
      startOffset: transcript.indexOf('Client holds bitcoin on a hardware wallet'),
      endOffset:
        transcript.indexOf('Client holds bitcoin on a hardware wallet') +
        'Client holds bitcoin on a hardware wallet'.length,
    });
  });

  it('drops facts whose evidence quote is not an exact transcript substring', () => {
    const result = parseExtractedFacts(
      { custody: { currentArrangement: fact('Client uses multisig', 'not in transcript') } },
      'Client uses multisig.'
    );

    expect(result).toEqual({ ok: true, facts: {} });
  });

  it('maps hardware-wallet custody to currentArrangement', () => {
    const result = parseExtractedFacts(
      { custody: { currentArrangement: fact('my assets are on a hardware wallet') } },
      'my assets are on a hardware wallet'
    );

    expect(result).toEqual({
      ok: true,
      facts: {
        custody: { currentArrangement: 'my assets are on a hardware wallet' },
        evidence: [
          {
            factPath: 'custody.currentArrangement',
            quote: 'my assets are on a hardware wallet',
            startOffset: 0,
            endOffset: 'my assets are on a hardware wallet'.length,
          },
        ],
      },
    });
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
