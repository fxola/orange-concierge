import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';
import { z } from 'zod';

export const submitInteractionRequestSchema = z
  .object({
    clientId: z.string(),
    transcript: z.string(),
  })
  .strict();

export type SubmitInteractionRequest = z.infer<typeof submitInteractionRequestSchema>;

export const POST = withRequestActor(async (request, actor) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = submitInteractionRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_input' }, { status: 400 });
  }

  const result = await getApplication().interaction.submit({
    actor,
    clientId: parsed.data.clientId,
    transcript: parsed.data.transcript,
  });

  if (result.isFailure()) {
    const error = result.getError();
    const code = error.code;

    if (code === 'blank_transcript') {
      return Response.json({ error: 'blank_transcript' }, { status: 400 });
    }

    if (code === 'invalid_client_id' || code === 'client_not_found') {
      return Response.json({ error: 'client_not_found' }, { status: 404 });
    }

    if (code === 'unauthorized_submit') {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }
    throw error;
  }

  const interaction = result.getValue();

  return Response.json(interaction, { status: 201 });
});
