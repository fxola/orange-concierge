import { FACT_FIELD_KEYS, TOP_LEVEL_FACT_KEYS } from './constants';
import { hasOwn, isRecord } from './utils';

export function hasRecognizedFactShape(raw: unknown): boolean {
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
