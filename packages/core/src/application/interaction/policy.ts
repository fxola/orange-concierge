import { Actor } from '../../domain/actor.js';

export const canAnalyzeInteractions = (actor: Actor): boolean => {
  const isAdmin = actor.role === 'admin';
  const isConsultant = actor.role === 'consultant';
  return isAdmin || isConsultant;
};

export const canSubmitInteractions = (actor: Actor): boolean => {
  const isAdmin = actor.role === 'admin';
  const isConsultant = actor.role === 'consultant';
  return isAdmin || isConsultant;
};

export const canViewInteractions = (actor: Actor): boolean => {
  return actor.role === 'admin' || actor.role === 'consultant' || actor.role === 'reviewer';
};

export const canVerifyInteractionFacts = (actor: Actor): boolean => {
  const isAdmin = actor.role === 'admin';
  const isConsultant = actor.role === 'consultant';
  return isAdmin || isConsultant;
};
