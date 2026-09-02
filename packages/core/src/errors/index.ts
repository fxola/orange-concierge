import { Actor } from '../domain/actor';

export class UnauthorizedAnalyzeInteractionError extends Error {
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot analyze interactions`);
    this.name = 'UnauthorizedAnalyzeInteractionError';
  }
}

export class InteractionNotFoundError extends Error {
  constructor(id: string) {
    super(`Interaction:${id} not found`);
    this.name = 'InteractionNotFoundError';
  }
}

export class InvalidInteractionStateError extends Error {
  constructor(status: string) {
    super(`Interaction with status ${status} cannot be analyzed`);
    this.name = 'InvalidInteractionStateError';
  }
}

export class InteractionAnalysisFailedError extends Error {
  constructor() {
    super('Interaction analysis failed');
    this.name = 'InteractionAnalysisFailedError';
  }
}
