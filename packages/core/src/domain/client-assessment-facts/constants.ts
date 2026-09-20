export const TOP_LEVEL_FACT_KEYS = ['custody', 'cybersecurity', 'planning'] as const;

export type FactGroupKey = (typeof TOP_LEVEL_FACT_KEYS)[number];

export const FACT_FIELD_KEYS = {
  custody: ['currentArrangement', 'assetsDiscussed', 'concerns'],
  cybersecurity: ['controls', 'risks', 'incidentHistory'],
  planning: ['goals', 'constraints', 'nextSteps'],
} satisfies Record<FactGroupKey, readonly string[]>;

export const PLACEHOLDER_VALUES = new Set([
  'string',
  'n/a',
  'na',
  'null',
  'none',
  'unknown',
  'tbd',
  '-',
]);

export const INCIDENT_KEYWORDS = [
  'breach',
  'hack',
  'incident',
  'compromise',
  'phish',
  'theft',
  'stolen',
  'loss',
  'attack',
  'scam',
  'fraud',
  'unauthorized',
] as const;

export const LOW_EVIDENCE_COVERAGE_RATIO = 0.5;
