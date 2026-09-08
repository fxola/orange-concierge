import { Actor } from '../domain/actor';

export class UnauthorizedAnalyzeInteractionError extends Error {
  readonly code = 'unauthorized_analyze';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot analyze interactions`);
    this.name = 'UnauthorizedAnalyzeInteractionError';
  }
}

export class InteractionNotFoundError extends Error {
  readonly code = 'interaction_not_found';
  constructor(id: string) {
    super(`Interaction:${id} not found`);
    this.name = 'InteractionNotFoundError';
  }
}

export class InvalidInteractionStateError extends Error {
  readonly code = 'invalid_interaction_state';
  constructor(status: string) {
    super(`Interaction with status ${status} cannot be analyzed`);
    this.name = 'InvalidInteractionStateError';
  }
}

export class InteractionAnalysisFailedError extends Error {
  readonly code = 'interaction_analysis_failed';
  constructor() {
    super('Interaction analysis failed');
    this.name = 'InteractionAnalysisFailedError';
  }
}

export class BlankTranscriptError extends Error {
  readonly code = 'blank_transcript';
  constructor() {
    super('Transcript must not be blank');
    this.name = 'BlankTranscriptError';
  }
}

export class UnauthorizedSubmitInteractionError extends Error {
  readonly code = 'unauthorized_submit';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot submit interactions`);
    this.name = 'UnauthorizedSubmitInteractionError';
  }
}

export class InteractionSubmissionFailedError extends Error {
  readonly code = 'submission_failed';
  constructor(cause?: unknown) {
    super('Interaction submission failed');
    this.name = 'InteractionSubmissionFailedError';
    this.cause = cause as Error | undefined;
  }
}

export class ClientNotFoundError extends Error {
  readonly code = 'client_not_found';
  constructor(id: string) {
    super(`Client:${id} not found`);
    this.name = 'ClientNotFoundError';
  }
}

export class InvalidClientIdError extends Error {
  readonly code = 'invalid_client_id';
  constructor() {
    super('Client id must be a valid UUID');
    this.name = 'InvalidClientIdError';
  }
}

export class InvalidPaginationError extends Error {
  readonly code = 'invalid_pagination';
  constructor() {
    super('Pagination must satisfy limit 1-100 and a non-negative integer offset');
    this.name = 'InvalidPaginationError';
  }
}

export class UnauthorizedViewClientsError extends Error {
  readonly code = 'unauthorized_view';
  constructor(role: Actor['role']) {
    super(`Actor role ${role} cannot view clients`);
    this.name = 'UnauthorizedViewClientsError';
  }
}

export class UnauthorizedError extends Error {
  readonly code = 'unauthorized';
  constructor() {
    super('You need to be logged in to perform this operation');
    this.name = 'UnauthorizedError';
  }
}
