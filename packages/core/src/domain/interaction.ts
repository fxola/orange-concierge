import z from 'zod';
import type { ExtractedFacts } from '../application/interaction/extracted-facts';

export type InteractionStatus = 'received' | 'analysis_blocked' | 'analysis_completed';

export type Interaction = Readonly<{
  id: string;
  clientId: string;
  submittedBy: string;
  status: InteractionStatus;
  transcript: string;
  createdAt: Date;
  extractedFacts?: ExtractedFacts;
}>;

export const interactionIdSchema = z.string().trim().pipe(z.uuid());

export const parseInteractionId = (
  raw: unknown
): { ok: true; interactionId: string } | { ok: false } => {
  const result = interactionIdSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false };
  }
  return { ok: true, interactionId: result.data };
};
