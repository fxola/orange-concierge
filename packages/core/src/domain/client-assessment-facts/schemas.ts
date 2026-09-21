import { z } from 'zod';
import { FACT_FIELD_KEYS, LIST_FACT_FIELDS, TOP_LEVEL_FACT_KEYS } from './constants';

export const ASSESSMENT_FACT_TEXT_MAX_LENGTH = 500;
export const ASSESSMENT_FACT_LIST_MAX_ITEMS = 10;
export const ASSESSMENT_EVIDENCE_MAX_ITEMS = 30;

function buildFactPathPattern(): string {
  const groups = TOP_LEVEL_FACT_KEYS.map((group) => {
    const fields = FACT_FIELD_KEYS[group]
      .map((field) =>
        LIST_FACT_FIELDS.has(`${group}.${field}` as never) ? `${field}\\[\\d+\\]` : field
      )
      .join('|');
    return `${group}\\.(${fields})`;
  }).join('|');
  return `^(${groups})$`;
}

export const ASSESSMENT_FACT_PATH_PATTERN = buildFactPathPattern();

export const assessmentFactTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(ASSESSMENT_FACT_TEXT_MAX_LENGTH);

export const assessmentModelFactSchema = z
  .object({
    text: assessmentFactTextSchema,
    quote: assessmentFactTextSchema,
  })
  .strict();

export const assessmentModelFactListSchema = z
  .array(assessmentModelFactSchema)
  .max(ASSESSMENT_FACT_LIST_MAX_ITEMS);

const assessmentModelCustodySchema = z
  .object({
    currentArrangement: assessmentModelFactSchema.optional(),
    assetsDiscussed: assessmentModelFactListSchema.optional(),
    concerns: assessmentModelFactListSchema.optional(),
  })
  .strict();

const assessmentModelCybersecuritySchema = z
  .object({
    controls: assessmentModelFactListSchema.optional(),
    risks: assessmentModelFactListSchema.optional(),
    incidentHistory: assessmentModelFactSchema.optional(),
  })
  .strict();

const assessmentModelPlanningSchema = z
  .object({
    goals: assessmentModelFactListSchema.optional(),
    constraints: assessmentModelFactListSchema.optional(),
    nextSteps: assessmentModelFactListSchema.optional(),
  })
  .strict();

export const assessmentModelOutputSchema = z
  .object({
    custody: assessmentModelCustodySchema.optional(),
    cybersecurity: assessmentModelCybersecuritySchema.optional(),
    planning: assessmentModelPlanningSchema.optional(),
  })
  .strict();

export const factText = assessmentFactTextSchema;
export const factList = z.array(factText).max(ASSESSMENT_FACT_LIST_MAX_ITEMS);
export const factPathSchema = z.string().regex(new RegExp(ASSESSMENT_FACT_PATH_PATTERN));

const custodyFactsSchema = z
  .object({
    currentArrangement: factText.optional(),
    assetsDiscussed: factList.optional(),
    concerns: factList.optional(),
  })
  .strict();

const cybersecurityFactsSchema = z
  .object({
    controls: factList.optional(),
    risks: factList.optional(),
    incidentHistory: factText.optional(),
  })
  .strict();

const planningFactsSchema = z
  .object({
    goals: factList.optional(),
    constraints: factList.optional(),
    nextSteps: factList.optional(),
  })
  .strict();

export const evidenceReferenceSchema = z
  .object({
    factPath: factPathSchema,
    quote: factText,
    startOffset: z.number().int().min(0),
    endOffset: z.number().int().min(0),
  })
  .strict();

export const extractedFactsSchema = z
  .object({
    custody: custodyFactsSchema.optional(),
    cybersecurity: cybersecurityFactsSchema.optional(),
    planning: planningFactsSchema.optional(),
    evidence: z.array(evidenceReferenceSchema).max(ASSESSMENT_EVIDENCE_MAX_ITEMS).optional(),
  })
  .strict();

export const assessmentModelOutputJsonSchema = z.toJSONSchema(assessmentModelOutputSchema, {
  target: 'draft-7',
}) as Record<string, unknown>;

export type AssessmentModelFact = z.infer<typeof assessmentModelFactSchema>;
export type AssessmentModelOutput = z.infer<typeof assessmentModelOutputSchema>;
export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;
export type ExtractedFacts = z.infer<typeof extractedFactsSchema>;

export type ParseExtractedFactsResult =
  | Readonly<{ ok: true; facts: ExtractedFacts }>
  | Readonly<{ ok: false }>;
