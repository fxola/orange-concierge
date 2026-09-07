import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isActorRole, UnauthorizedError, type Actor, type ActorRole } from '@orange-concierge/core';

import { getSession } from './session';

export type AuthenticatedUser = Readonly<{
  id: string;
  role: ActorRole;
}>;

export const toActor = (user: AuthenticatedUser): Actor => ({
  id: user.id,
  role: user.role,
});

function sessionUserToActor(user: unknown): Actor | null {
  const candidate = user as { id?: unknown; role?: unknown };
  const { id, role } = candidate;

  if (typeof id !== 'string' || typeof role !== 'string' || !isActorRole(role)) {
    return null;
  }

  return toActor({ id, role });
}

export async function getActorFromHeaders(requestHeaders: Headers): Promise<Actor | null> {
  const session = await getSession(requestHeaders);

  if (!session?.user) {
    return null;
  }

  return sessionUserToActor(session.user);
}

export async function getCurrentActor(): Promise<Actor | null> {
  return getActorFromHeaders(await headers());
}

export async function requirePageActor(): Promise<Actor> {
  const actor = await getCurrentActor();
  if (!actor) {
    redirect('/login');
  }
  return actor;
}

export async function requireRequestActor(request?: Request): Promise<Actor> {
  const actor = request ? await getActorFromHeaders(request.headers) : await getCurrentActor();
  if (!actor) {
    throw new UnauthorizedError();
  }
  return actor;
}
