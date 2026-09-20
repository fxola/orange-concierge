import { z } from 'zod';

export const factText = z.string().trim().min(1).max(500);

export const factList = z.union([
  z.array(factText).max(10),
  factText.transform((text) => [text]),
]);

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

export const evidenceInputSchema = z
  .object({
    factPath: z.string().trim().min(1).max(200),
    quote: z.string().trim().min(1).max(500),
  })
  .strip();

export const evidenceReferenceSchema = z
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
