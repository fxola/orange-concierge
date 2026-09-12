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

const evidenceInputSchema = z
  .object({
    factPath: z.string().trim().min(1).max(200),
    quote: z.string().trim().min(1).max(500),
  })
  .strip();

const evidenceReferenceSchema = z
  .object({
    factPath: z.string().trim().min(1).max(200),
    quote: z.string().trim().min(1).max(500),
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(0),
  })
  .strip();

export const extractedFactsSchema = z
  .object({
    custody: custodyFactsSchema.optional(),
    cybersecurity: cybersecurityFactsSchema.optional(),
    planning: planningFactsSchema.optional(),
    evidence: z.array(evidenceReferenceSchema).max(30).optional(),
  })
  .strip();

export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;

export type ExtractedFacts = z.infer<typeof extractedFactsSchema>;

export type ParseExtractedFactsResult =
  | Readonly<{ ok: true; facts: ExtractedFacts }>
  | Readonly<{ ok: false }>;

const TOP_LEVEL_FACT_KEYS = ['custody', 'cybersecurity', 'planning'] as const;

const FACT_FIELD_KEYS = {
  custody: ['currentArrangement', 'assetsDiscussed', 'concerns'],
  cybersecurity: ['controls', 'risks', 'incidentHistory'],
  planning: ['goals', 'constraints', 'nextSteps'],
} satisfies Record<(typeof TOP_LEVEL_FACT_KEYS)[number], readonly string[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function hasRecognizedFactShape(raw: unknown): boolean {
  if (!isRecord(raw)) {
    return false;
  }

  const topLevelKeys = Object.keys(raw);
  if (topLevelKeys.length === 0) {
    return true;
  }

  return TOP_LEVEL_FACT_KEYS.some((groupKey) => {
    if (!hasOwn(raw, groupKey)) {
      return false;
    }

    const group = raw[groupKey];
    if (!isRecord(group)) {
      return true;
    }

    if (Object.keys(group).length === 0) {
      return true;
    }

    return FACT_FIELD_KEYS[groupKey].some((fieldKey) => hasOwn(group, fieldKey));
  });
}

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

function dropEmptyFactGroups(facts: ExtractedFacts): ExtractedFacts {
  const { evidence, ...groups } = facts;
  const cleanedGroups = Object.fromEntries(
    Object.entries(groups).filter(([, group]) => Object.keys(group ?? {}).length > 0)
  ) as Omit<ExtractedFacts, 'evidence'>;

  if (evidence && evidence.length > 0) {
    return { ...cleanedGroups, evidence };
  }

  return cleanedGroups;
}

type ParsedFactPath = Readonly<{
  group: (typeof TOP_LEVEL_FACT_KEYS)[number];
  field: string;
  index?: number;
}>;

function parseFactPath(factPath: string): ParsedFactPath | null {
  const dot = factPath.indexOf('.');
  if (dot <= 0 || dot === factPath.length - 1) {
    return null;
  }

  const group = factPath.slice(0, dot) as ParsedFactPath['group'];
  if (!(TOP_LEVEL_FACT_KEYS as readonly string[]).includes(group)) {
    return null;
  }

  const fieldPart = factPath.slice(dot + 1);
  const match = /^([A-Za-z]+)(?:\[(\d+)\])?$/.exec(fieldPart);
  if (!match) {
    return null;
  }

  const [, field, indexText] = match;
  if (!(FACT_FIELD_KEYS[group] as readonly string[]).includes(field)) {
    return null;
  }

  if (indexText !== undefined) {
    const index = Number(indexText);
    if (!Number.isInteger(index) || index < 0 || index > 9) {
      return null;
    }
    return { group, field, index };
  }

  return { group, field };
}

function factExistsForPath(facts: ExtractedFacts, path: ParsedFactPath): boolean {
  const group = (facts as Record<string, unknown>)[path.group];
  if (!isRecord(group) || !hasOwn(group, path.field)) {
    return false;
  }

  const value = group[path.field];
  if (typeof value === 'string') {
    return path.index === undefined;
  }

  if (Array.isArray(value)) {
    if (path.index === undefined) {
      return value.length > 0;
    }
    return path.index < value.length && typeof value[path.index] === 'string';
  }

  return false;
}

function resolveEvidence(
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

  const factsWithoutEvidence = dropEmptyFactGroups(result.data);

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
