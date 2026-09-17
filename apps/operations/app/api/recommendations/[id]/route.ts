import type { EditRecommendationDraftPatch } from '@orange-concierge/core';
import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>;

const parsePatch = async (request: Request): Promise<EditRecommendationDraftPatch | undefined> => {
  try {
    const body = (await request.json()) as Partial<EditRecommendationDraftPatch>;
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return undefined;
    }

    return {
      title: body.title as EditRecommendationDraftPatch['title'],
      summary: body.summary as EditRecommendationDraftPatch['summary'],
      priority: body.priority as EditRecommendationDraftPatch['priority'],
    };
  } catch {
    return undefined;
  }
};

export const PATCH = withRequestActor(async (request, actor, context: RouteContext) => {
  const { id } = await context.params;
  const patch = await parsePatch(request);

  if (!patch) {
    return Response.json({ error: 'invalid_recommendation_edit' }, { status: 400 });
  }

  const result = await getApplication().recommendations.editDraft({
    actor,
    recommendationId: id,
    patch,
  });

  if (result.isFailure()) {
    const code = result.getError().code;

    if (code === 'invalid_recommendation_id' || code === 'invalid_recommendation_edit') {
      return Response.json({ error: code }, { status: 400 });
    }

    if (code === 'unauthorized_recommendation_edit') {
      return Response.json({ error: code }, { status: 403 });
    }

    if (code === 'recommendation_not_found') {
      return Response.json({ error: code }, { status: 404 });
    }

    if (code === 'invalid_recommendation_transition') {
      return Response.json({ error: code }, { status: 409 });
    }

    if (code === 'recommendation_edit_failed') {
      return Response.json({ error: code }, { status: 500 });
    }

    return Response.json({ error: code }, { status: 500 });
  }

  return Response.json({ recommendation: result.getValue() }, { status: 200 });
});
