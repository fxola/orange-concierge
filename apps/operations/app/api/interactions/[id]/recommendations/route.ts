import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>;

export const POST = withRequestActor(async (_request, actor, context: RouteContext) => {
  const { id } = await context.params;

  const result = await getApplication().recommendations.generate({ actor, interactionId: id });

  if (result.isFailure()) {
    const code = result.getError().code;
    if (code === 'interaction_not_found') {
      return Response.json({ error: code }, { status: 404 });
    }

    if (code === 'recommendation_drafting_failed') {
      return Response.json({ error: code }, { status: 503 });
    }

    return Response.json({ error: code }, { status: 500 });
  }

  return Response.json(result.getValue(), { status: 200 });
});
