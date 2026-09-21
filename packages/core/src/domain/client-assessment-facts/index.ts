import { dropEmptyFactGroups } from './cleaning';
import { LOW_EVIDENCE_COVERAGE_RATIO } from './constants';
import { calculateEvidenceCoverage as calculateCoverage, type EvidenceCoverage } from './coverage';
import { factPathsFor as getFactPaths } from './fact-path';
import { mapAssessmentModelOutput } from './model-output';
import {
  assessmentModelOutputJsonSchema,
  assessmentModelOutputSchema,
  extractedFactsSchema,
  type EvidenceReference,
  type ExtractedFacts,
  type ParseExtractedFactsResult,
} from './schemas';

export function parseExtractedFacts(raw: unknown, transcript = ''): ParseExtractedFactsResult {
  const result = assessmentModelOutputSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false };
  }

  const mapped = mapAssessmentModelOutput(result.data, transcript);
  const { evidence: generatedEvidence = [], ...mappedFactGroups } = mapped;
  const finalFacts = dropEmptyFactGroups({
    ...mappedFactGroups,
    ...(generatedEvidence.length > 0 ? { evidence: generatedEvidence } : {}),
  });

  const parsedFinalFacts = extractedFactsSchema.safeParse(finalFacts);
  if (!parsedFinalFacts.success) {
    return { ok: false };
  }

  return { ok: true, facts: parsedFinalFacts.data };
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

export { assessmentModelOutputJsonSchema, extractedFactsSchema, LOW_EVIDENCE_COVERAGE_RATIO };

export type { EvidenceCoverage, EvidenceReference, ExtractedFacts, ParseExtractedFactsResult };
