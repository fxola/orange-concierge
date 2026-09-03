import type { Actor } from '../../domain/actor';
import type { Interaction } from '../../domain/interaction';
import type {
  BlankTranscriptError,
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InteractionSubmissionFailedError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
  UnauthorizedSubmitInteractionError,
} from '../../errors';
import type { AuditPort } from '../../ports/audit';
import type { InteractionRepository } from '../../ports/interaction-repository';
import type { InteractionSubmissionStore } from '../../ports/interaction-submission-store';
import type { SecretScanner } from '../../ports/secret-scanner';
import type { StructuredLLM } from '../../ports/structured-llm';
import type { Result } from './result';

export type AnalyzeInteractionInput = Readonly<{
  actor: Actor;
  interactionId: string;
}>;

export type AnalyzeInteractionDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
  secretScanner: SecretScanner;
  structuredLLM: StructuredLLM;
  audit: AuditPort;
}>;

export type AnalyzeInteractionError =
  | UnauthorizedAnalyzeInteractionError
  | InteractionAnalysisFailedError
  | InteractionNotFoundError
  | InvalidInteractionStateError;

export type AnalyzeInteractionResult = Result<Interaction, AnalyzeInteractionError>;

export type SubmitInteractionInput = Readonly<{
  actor: Actor;
  clientId: string;
  transcript: string;
}>;

export type SubmitInteractionDependencies = Readonly<{
  submissionStore: InteractionSubmissionStore;
  newInteractionId: () => string;
  now: () => Date;
}>;

export type SubmitInteractionError =
  | BlankTranscriptError
  | UnauthorizedSubmitInteractionError
  | InteractionSubmissionFailedError;

export type SubmitInteractionResult = Result<Interaction, SubmitInteractionError>;
