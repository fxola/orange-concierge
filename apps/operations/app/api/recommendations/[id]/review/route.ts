import type { ReviewRecommendationDecision } from '@orange-concierge/core';
import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>;

const parseDecision = async (
  request: Request
): Promise<ReviewRecommendationDecision | undefined> => {
  try {
    const body = (await request.json()) as { decision?: unknown };
    return body.decision === 'approved' || body.decision === 'rejected' ? body.decision : undefined;
  } catch {
    return undefined;
  }
};

export const POST = withRequestActor(async (request, actor, context: RouteContext) => {
  const { id } = await context.params;
  const decision = await parseDecision(request);

  if (!decision) {
    return Response.json({ error: 'invalid_review_decision' }, { status: 400 });
  }

  const result = await getApplication().recommendations.review({
    actor,
    recommendationId: id,
    decision,
  });

  if (result.isFailure()) {
    const code = result.getError().code;

    if (code === 'invalid_recommendation_id') {
      return Response.json({ error: code }, { status: 400 });
    }

    if (code === 'unauthorized_recommendation_review') {
      return Response.json({ error: code }, { status: 403 });
    }

    if (code === 'recommendation_not_found') {
      return Response.json({ error: code }, { status: 404 });
    }

    if (code === 'invalid_recommendation_transition') {
      return Response.json({ error: code }, { status: 409 });
    }

    if (code === 'recommendation_review_failed') {
      return Response.json({ error: code }, { status: 500 });
    }

    return Response.json({ error: code }, { status: 500 });
  }

  return Response.json({ recommendation: result.getValue() }, { status: 200 });
});
