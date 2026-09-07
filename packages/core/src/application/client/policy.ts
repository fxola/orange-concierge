import type { Actor } from '../../domain/actor';

export const canViewClients = (actor: Actor): boolean => {
  return actor.role === 'admin' || actor.role === 'consultant' || actor.role === 'reviewer';
};
