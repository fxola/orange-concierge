export const TOP_LEVEL_FACT_KEYS = ['custody', 'cybersecurity', 'planning'] as const;

export type FactGroupKey = (typeof TOP_LEVEL_FACT_KEYS)[number];

export const FACT_FIELD_KEYS = {
  custody: ['currentArrangement', 'assetsDiscussed', 'concerns'],
  cybersecurity: ['controls', 'risks', 'incidentHistory'],
  planning: ['goals', 'constraints', 'nextSteps'],
} satisfies Record<FactGroupKey, readonly string[]>;

export const LIST_FACT_FIELDS = new Set([
  'custody.assetsDiscussed',
  'custody.concerns',
  'cybersecurity.controls',
  'cybersecurity.risks',
  'planning.goals',
  'planning.constraints',
  'planning.nextSteps',
] as const);

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

export const LOW_EVIDENCE_COVERAGE_RATIO = 0.5;
