import 'server-only';

import { type Actor } from '@orange-concierge/core';

import { requireRequestActor } from '@/server/actor';

type AuthenticatedHandler<T extends unknown[]> = (
  request: Request,
  actor: Actor,
  ...rest: T
) => Promise<Response>;

export function withRequestActor<T extends unknown[]>(handler: AuthenticatedHandler<T>) {
  return async function authenticatedHandler(request: Request, ...rest: T): Promise<Response> {
    try {
      const actor = await requireRequestActor(request);

      return await handler(request, actor, ...rest);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'unauthorized') {
        return Response.json({ error: 'unauthorized' }, { status: 401 });
      }

      // Next control-flow throws (`redirect()`, `notFound()`) must keep
      // propagating — only real failures become JSON 500s.
      if (
        error instanceof Error &&
        'digest' in error &&
        typeof error.digest === 'string' &&
        error.digest.startsWith('NEXT_')
      ) {
        throw error;
      }

      console.error('[api] unhandled route error', error);
      return Response.json({ error: 'internal_error' }, { status: 500 });
    }
  };
}
