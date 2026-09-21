import type { ExtractedFacts } from './schemas';

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
