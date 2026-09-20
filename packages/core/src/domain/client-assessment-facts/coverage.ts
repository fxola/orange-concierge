import { LOW_EVIDENCE_COVERAGE_RATIO } from './constants';
import { factPathsFor } from './fact-path';
import type { ExtractedFacts } from './schemas';

export type EvidenceCoverage = Readonly<{
  total: number;
  sourced: number;
  ratio: number;
  isLowConfidence: boolean;
}>;

export function calculateEvidenceCoverage(
  facts: ExtractedFacts,
  verifiedFactPaths: readonly string[] = []
): EvidenceCoverage {
  const paths = factPathsFor(facts);
  const total = paths.length;
  const pathSet = new Set(paths);

  const evidenced = new Set((facts.evidence ?? []).map((entry) => entry.factPath));

  const seen = new Set<string>();
  let verifiedCovered = 0;

  for (const candidate of verifiedFactPaths) {
    if (!pathSet.has(candidate) || evidenced.has(candidate) || seen.has(candidate)) {
      continue;
    }

    seen.add(candidate);
    verifiedCovered += 1;
  }

  const sourced = Math.min(total, (facts.evidence ?? []).length + verifiedCovered);
  const ratio = total > 0 ? sourced / total : 1;

  return {
    total,
    sourced,
    ratio,
    isLowConfidence: total > 0 && ratio < LOW_EVIDENCE_COVERAGE_RATIO,
  };
}
