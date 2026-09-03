export const actorRoles = ['admin', 'consultant', 'reviewer'] as const;
export type ActorRole = (typeof actorRoles)[number];
export type Actor = Readonly<{
  id: string;
  role: ActorRole;
}>;

export const isActorRole = (value: string): value is ActorRole =>
  actorRoles.includes(value as ActorRole);
