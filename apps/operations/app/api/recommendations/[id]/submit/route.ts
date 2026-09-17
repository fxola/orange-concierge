import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>;

export const POST = withRequestActor(async (_request, actor, context: RouteContext) => {
  const { id } = await context.params;
  const result = await getApplication().recommendations.submitForReview({
    actor,
    recommendationId: id,
  });

  if (result.isFailure()) {
    const code = result.getError().code;

    if (code === 'invalid_recommendation_id') {
      return Response.json({ error: code }, { status: 400 });
    }

    if (code === 'unauthorized_recommendation_submit_for_review') {
      return Response.json({ error: code }, { status: 403 });
    }

    if (code === 'recommendation_not_found') {
      return Response.json({ error: code }, { status: 404 });
    }

    if (code === 'invalid_recommendation_transition') {
      return Response.json({ error: code }, { status: 409 });
    }

    return Response.json({ error: code }, { status: 500 });
  }

  return Response.json({ recommendation: result.getValue() }, { status: 200 });
});
