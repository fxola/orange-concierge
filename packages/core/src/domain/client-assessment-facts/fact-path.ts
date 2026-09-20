import { FACT_FIELD_KEYS, TOP_LEVEL_FACT_KEYS, type FactGroupKey } from './constants';
import type { ExtractedFacts } from './schemas';
import { hasOwn, isRecord } from './utils';

export type ParsedFactPath = Readonly<{
  group: FactGroupKey;
  field: string;
  index?: number;
}>;

export function parseFactPath(factPath: string): ParsedFactPath | null {
  const dot = factPath.indexOf('.');

  if (dot <= 0 || dot === factPath.length - 1) {
    return null;
  }

  const group = factPath.slice(0, dot) as FactGroupKey;

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

export function factExistsForPath(facts: ExtractedFacts, path: ParsedFactPath): boolean {
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

function pushListPaths(paths: string[], base: string, values: readonly string[] | undefined): void {
  if (!values) {
    return;
  }

  values.forEach((_, index) => {
    paths.push(`${base}[${index}]`);
  });
}

export function factPathsFor(facts: ExtractedFacts): string[] {
  const paths: string[] = [];

  if (facts.custody?.currentArrangement) {
    paths.push('custody.currentArrangement');
  }

  pushListPaths(paths, 'custody.assetsDiscussed', facts.custody?.assetsDiscussed);

  pushListPaths(paths, 'custody.concerns', facts.custody?.concerns);

  pushListPaths(paths, 'cybersecurity.controls', facts.cybersecurity?.controls);

  pushListPaths(paths, 'cybersecurity.risks', facts.cybersecurity?.risks);

  if (facts.cybersecurity?.incidentHistory) {
    paths.push('cybersecurity.incidentHistory');
  }

  pushListPaths(paths, 'planning.goals', facts.planning?.goals);

  pushListPaths(paths, 'planning.constraints', facts.planning?.constraints);

  pushListPaths(paths, 'planning.nextSteps', facts.planning?.nextSteps);

  return paths;
}
