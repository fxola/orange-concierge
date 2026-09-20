import { PLACEHOLDER_VALUES } from './constants';
import { factExistsForPath, parseFactPath } from './fact-path';
import { evidenceInputSchema, type EvidenceReference, type ExtractedFacts } from './schemas';
import { isRecord } from './utils';

export function resolveEvidence(
  rawEvidence: unknown,
  facts: ExtractedFacts,
  transcript: string
): EvidenceReference[] {
  if (!Array.isArray(rawEvidence) || transcript.trim().length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const resolved: EvidenceReference[] = [];

  for (const entry of rawEvidence.slice(0, 30)) {
    if (!isRecord(entry)) {
      continue;
    }

    const parsedInput = evidenceInputSchema.safeParse({
      factPath: entry.factPath,
      quote: entry.quote,
    });

    if (!parsedInput.success) {
      continue;
    }

    const factPath = parsedInput.data.factPath.trim();
    const quote = parsedInput.data.quote.trim();

    if (PLACEHOLDER_VALUES.has(quote.toLowerCase())) {
      continue;
    }

    const path = parseFactPath(factPath);
    if (!path || !factExistsForPath(facts, path)) {
      continue;
    }

    const startOffset = transcript.indexOf(quote);
    if (startOffset < 0) {
      continue;
    }

    const key = `${factPath}::${startOffset}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    resolved.push({
      factPath,
      quote,
      startOffset,
      endOffset: startOffset + quote.length,
    });
  }

  return resolved;
}
