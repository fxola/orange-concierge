import 'server-only';
import { cache } from 'react';
import { isActorRole, UnauthorizedError, type Actor, type ActorRole } from '@orange-concierge/core';
import { getApplication } from '@orange-concierge/infrastructure';

export type AuthenticatedUser = Readonly<{
  id: string;
  role: ActorRole;
}>;

export const toActor = (user: AuthenticatedUser): Actor => ({
  id: user.id,
  role: user.role,
});

/**
 * Per-request session lookup, deduplicated by session cookie.
 *
 * Keyed on the cookie string (a primitive) rather than the `Headers`
 * object: `React.cache()` compares arguments with `Object.is`, and each
 * `await headers()` call site produces a distinct instance that would
 * never hit the cache. Session resolution only needs the cookie, so a
 * cookie-only `Headers` is forwarded to Better Auth.
 */
const getSessionByCookie = cache(async (cookie: string) => {
  const application = getApplication();
  return application.auth.api.getSession({
    headers: new Headers(cookie ? { cookie } : {}),
  });
});

export async function getSession(headers: Headers) {
  return getSessionByCookie(headers.get('cookie') ?? '');
}

export async function getCurrentActor(headers: Headers): Promise<Actor | null> {
  const session = await getSession(headers);

  if (!session?.user) {
    return null;
  }

  const candidate = session.user as { id?: unknown; role?: unknown };
  const { id, role } = candidate;

  if (typeof id !== 'string' || typeof role !== 'string' || !isActorRole(role)) {
    return null;
  }

  return toActor({ id, role });
}

export async function requireActor(headers: Headers): Promise<Actor> {
  const actor = await getCurrentActor(headers);
  if (!actor) {
    throw new UnauthorizedError();
  }
  return actor;
}
