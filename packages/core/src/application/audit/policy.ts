import type { Actor } from '../../domain/actor';

export const canViewAuditTrail = (actor: Actor): boolean => {
  return actor.role === 'admin' || actor.role === 'reviewer';
};
