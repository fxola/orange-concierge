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

export class BlankTranscriptError extends Error {
  constructor() {
    super('Transcript must not be blank');
    this.name = 'BlankTranscriptError';
  }
}

export class UnauthorizedSubmitInteractionError extends Error {
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot submit interactions`);
    this.name = 'UnauthorizedSubmitInteractionError';
  }
}

export class InteractionSubmissionFailedError extends Error {
  constructor(cause?: unknown) {
    super('Interaction submission failed');
    this.name = 'InteractionSubmissionFailedError';
    this.cause = cause as Error | undefined;
  }
}
