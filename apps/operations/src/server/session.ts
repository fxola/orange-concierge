import 'server-only';
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

export async function getSession(headers: Headers) {
  const application = getApplication();
  return application.auth.api.getSession({ headers });
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
