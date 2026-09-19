import { getApplication } from '@orange-concierge/infrastructure';

import { withRequestActor } from '@/server/auth-guard';

type RouteContext = Readonly<{ params: Promise<Readonly<{ id: string }>> }>;

const parseFactPaths = async (request: Request): Promise<readonly string[] | undefined> => {
  try {
    const body = (await request.json()) as { factPaths?: unknown };
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return undefined;
    }

    if (!Array.isArray(body.factPaths)) {
      return undefined;
    }

    return body.factPaths;
  } catch {
    return undefined;
  }
};

export const POST = withRequestActor(async (request, actor, context: RouteContext) => {
  const { id } = await context.params;
  const factPaths = await parseFactPaths(request);

  if (!factPaths) {
    return Response.json({ error: 'invalid_fact_path' }, { status: 400 });
  }

  const result = await getApplication().interaction.verifyFacts({
    actor,
    interactionId: id,
    factPaths,
  });

  if (result.isFailure()) {
    const code = result.getError().code;

    if (code === 'invalid_interaction_id' || code === 'invalid_fact_path') {
      return Response.json({ error: code }, { status: 400 });
    }

    if (code === 'unauthorized_verify_facts') {
      return Response.json({ error: code }, { status: 403 });
    }

    if (code === 'interaction_not_found') {
      return Response.json({ error: code }, { status: 404 });
    }

    if (code === 'invalid_interaction_state') {
      return Response.json({ error: code }, { status: 409 });
    }

    return Response.json({ error: code }, { status: 500 });
  }

  return Response.json({ interaction: result.getValue().interaction }, { status: 200 });
});
