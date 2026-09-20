import { dropEmpties, dropEmptyFactGroups } from './cleaning';
import { LOW_EVIDENCE_COVERAGE_RATIO } from './constants';
import { calculateEvidenceCoverage as calculateCoverage, type EvidenceCoverage } from './coverage';
import { resolveEvidence } from './evidence';
import { factPathsFor as getFactPaths } from './fact-path';
import { hasRecognizedFactShape } from './fact-shape';
import {
  extractedFactsSchema,
  type EvidenceReference,
  type ExtractedFacts,
  type ParseExtractedFactsResult,
} from './schemas';
import { normalizeSecurityPolarity } from './security-normalization';
import { isRecord } from './utils';

export function parseExtractedFacts(raw: unknown, transcript = ''): ParseExtractedFactsResult {
  if (!hasRecognizedFactShape(raw)) {
    return { ok: false };
  }

  const cleaned = (dropEmpties(raw) ?? {}) as Record<string, unknown>;
  const { evidence: rawEvidence, ...factsRaw } = isRecord(cleaned) ? cleaned : {};

  const result = extractedFactsSchema.safeParse(factsRaw);
  if (!result.success) {
    return { ok: false };
  }

  const cleanedFacts = dropEmptyFactGroups(result.data);
  const normalizedFacts = normalizeSecurityPolarity(cleanedFacts, transcript);
  const factsWithoutEvidence = dropEmptyFactGroups(normalizedFacts);

  if (rawEvidence === undefined) {
    return { ok: true, facts: factsWithoutEvidence };
  }

  if (!Array.isArray(rawEvidence)) {
    return { ok: false };
  }

  const evidence = resolveEvidence(rawEvidence, factsWithoutEvidence, transcript);

  if (evidence.length === 0 && rawEvidence.length > 0) {
    return { ok: true, facts: factsWithoutEvidence };
  }

  return {
    ok: true,
    facts: dropEmptyFactGroups({ ...factsWithoutEvidence, evidence }),
  };
}

export function factPathsFor(facts: ExtractedFacts): string[] {
  return getFactPaths(facts);
}

export function calculateEvidenceCoverage(
  facts: ExtractedFacts,
  verifiedFactPaths: readonly string[] = []
): EvidenceCoverage {
  return calculateCoverage(facts, verifiedFactPaths);
}

export { extractedFactsSchema, LOW_EVIDENCE_COVERAGE_RATIO };

export type { EvidenceCoverage, EvidenceReference, ExtractedFacts, ParseExtractedFactsResult };
