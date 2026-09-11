import { z } from 'zod';

const factText = z.string().trim().min(1).max(500);

/**
 * List fields accept a bare string and wrap it.
 *
 * Small models sometimes emit `"concerns": "losing a key"` instead of an
 * array. The meaning is unambiguous, so coerce rather than discard the
 * whole assessment.
 */
const factList = z.union([z.array(factText).max(10), factText.transform((text) => [text])]);

const custodyFactsSchema = z
  .object({
    currentArrangement: factText.optional(),
    assetsDiscussed: factList.optional(),
    concerns: factList.optional(),
  })
  .strip();

const cybersecurityFactsSchema = z
  .object({
    controls: factList.optional(),
    risks: factList.optional(),
    incidentHistory: factText.optional(),
  })
  .strip();

const planningFactsSchema = z
  .object({
    goals: factList.optional(),
    constraints: factList.optional(),
    nextSteps: factList.optional(),
  })
  .strip();

export const extractedFactsSchema = z
  .object({
    custody: custodyFactsSchema.optional(),
    cybersecurity: cybersecurityFactsSchema.optional(),
    planning: planningFactsSchema.optional(),
  })
  .strip();

export type ExtractedFacts = z.infer<typeof extractedFactsSchema>;

export type ParseExtractedFactsResult =
  | Readonly<{ ok: true; facts: ExtractedFacts }>
  | Readonly<{ ok: false }>;

/**
 * Placeholder values small models echo from shape examples instead of
 * extracting real facts. Treated as absent.
 */
const PLACEHOLDER_VALUES = new Set(['string', 'n/a', 'na', 'null', 'none', 'unknown', 'tbd', '-']);

/**
 * Drop empty model output (blank strings, placeholders, empty
 * arrays/objects) before validation.
 *
 * The extraction prompt marks every field optional, but models still emit
 * `"incidentHistory": ""` or `"risks": []` for unknown facts. Without this,
 * a single blank string fails `min(1)` and discards the entire assessment.
 * Wrong types still fail validation as before.
 */
function dropEmpties(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed.length === 0 || PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) {
      return undefined;
    }

    return value;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map(dropEmpties)
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof value === 'object' && value !== null) {
    const cleaned: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      const parsed = dropEmpties(entry);

      if (parsed !== undefined) {
        cleaned[key] = parsed;
      }
    }

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return value;
}

export function parseExtractedFacts(raw: unknown): ParseExtractedFactsResult {
  const result = extractedFactsSchema.safeParse(dropEmpties(raw) ?? {});

  if (!result.success) {
    return { ok: false };
  }

  return { ok: true, facts: result.data };
}
