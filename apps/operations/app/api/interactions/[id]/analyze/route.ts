import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>;

export const POST = withRequestActor(async (request, actor, context: RouteContext) => {
  const { id } = await context.params;

  const result = await getApplication().interaction.analyze({ actor, interactionId: id });

  if (result.isFailure()) {
    const code = result.getError().code;
    console.log({ error: result.getError() });
    if (code === 'interaction_not_found') {
      return Response.json({ error: code }, { status: 404 });
    }

    if (code === 'unauthorized_analyze') {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    if (code === 'invalid_interaction_state') {
      return Response.json({ error: code }, { status: 409 });
    }

    return Response.json({ error: code }, { status: 500 });
  }

  return Response.json(result.getValue().interaction, { status: 200 });
});
