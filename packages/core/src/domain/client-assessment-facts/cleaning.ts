import { PLACEHOLDER_VALUES } from './constants';
import type { ExtractedFacts } from './schemas';

export function dropEmpties(value: unknown): unknown {
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

export function dropEmptyFactGroups(facts: ExtractedFacts): ExtractedFacts {
  const { evidence, ...groups } = facts;

  const cleanedGroups = Object.fromEntries(
    Object.entries(groups).filter(([, group]) => Object.keys(group ?? {}).length > 0)
  ) as Omit<ExtractedFacts, 'evidence'>;

  if (evidence && evidence.length > 0) {
    return { ...cleanedGroups, evidence };
  }

  return cleanedGroups;
}
