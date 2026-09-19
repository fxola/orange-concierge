import type { Actor } from '../../domain/actor';
import type { Interaction } from '../../domain/interaction';
import type { ExtractedFacts } from './extracted-facts';
import type {
  BlankTranscriptError,
  ClientNotFoundError,
  FactVerificationFailedError,
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InteractionSubmissionFailedError,
  InvalidClientIdError,
  InvalidFactPathError,
  InvalidInteractionIdError,
  InvalidInteractionStateError,
  InvalidPaginationError,
  UnauthorizedAnalyzeInteractionError,
  UnauthorizedSubmitInteractionError,
  UnauthorizedVerifyFactsError,
  UnauthorizedViewClientsError,
} from '../../errors';
import type { AuditPort } from '../../ports/audit';
import type { ClientRepository } from '../../ports/client-repository';
import type { InteractionRepository } from '../../ports/interaction-repository';
import type { InteractionTransactionManager } from '../../ports/transaction-manager';
import type { SecretScannerAPI } from '../../ports/secret-scanner';
import type { StructuredLLM } from '../../ports/structured-llm';
import type { Result } from '../result';

export type AnalyzeInteractionInput = Readonly<{
  actor: Actor;
  interactionId: string;
}>;

export type AnalyzeInteractionDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
  secretScanner: SecretScannerAPI;
  structuredLLM: StructuredLLM;
  audit: AuditPort;
  transactionManager: InteractionTransactionManager;
  now: () => Date;
}>;

export type AnalyzeInteractionError =
  | UnauthorizedAnalyzeInteractionError
  | InteractionAnalysisFailedError
  | InteractionNotFoundError
  | InvalidInteractionIdError
  | InvalidInteractionStateError;

export type AnalyzeInteractionSuccess = Readonly<{
  interaction: Interaction;
  extractedFacts?: ExtractedFacts;
}>;

export type AnalyzeInteractionResult = Result<AnalyzeInteractionSuccess, AnalyzeInteractionError>;

export type GetInteractionInput = Readonly<{
  actor: Actor;
  clientId: string;
  interactionId: string;
}>;

export type GetInteractionDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
}>;

export type GetInteractionError =
  | UnauthorizedViewClientsError
  | InvalidClientIdError
  | InvalidInteractionIdError
  | InteractionNotFoundError;

export type GetInteractionResult = Result<Interaction, GetInteractionError>;

export type ListInteractionsInput = Readonly<{
  actor: Actor;
  clientId: string;
  limit: number;
  offset: number;
}>;

export type ListInteractionsDependencies = Readonly<{
  clientRepository: ClientRepository;
  interactionsRepo: InteractionRepository;
}>;

export type ListInteractionsError =
  | UnauthorizedViewClientsError
  | InvalidClientIdError
  | InvalidPaginationError
  | ClientNotFoundError;

export type ListInteractionsResult = Result<readonly Interaction[], ListInteractionsError>;

export type SubmitInteractionInput = Readonly<{
  actor: Actor;
  clientId: string;
  transcript: string;
}>;

export type SubmitInteractionDependencies = Readonly<{
  transactionManager: InteractionTransactionManager;
  clientRepository: ClientRepository;
  newInteractionId: () => string;
  now: () => Date;
}>;

export type SubmitInteractionError =
  | BlankTranscriptError
  | InvalidClientIdError
  | UnauthorizedSubmitInteractionError
  | InteractionSubmissionFailedError
  | ClientNotFoundError;

export type SubmitInteractionResult = Result<Interaction, SubmitInteractionError>;

export type VerifyInteractionFactsInput = Readonly<{
  actor: Actor;
  interactionId: string;
  factPaths: readonly string[];
}>;

export type VerifyInteractionFactsDependencies = Readonly<{
  interactionsRepo: InteractionRepository;
  audit: AuditPort;
  transactionManager: InteractionTransactionManager;
  now: () => Date;
}>;

export type VerifyInteractionFactsError =
  | UnauthorizedVerifyFactsError
  | InvalidInteractionIdError
  | InteractionNotFoundError
  | InvalidInteractionStateError
  | InvalidFactPathError
  | FactVerificationFailedError;

export type VerifyInteractionFactsSuccess = Readonly<{
  interaction: Interaction;
}>;

export type VerifyInteractionFactsResult = Result<
  VerifyInteractionFactsSuccess,
  VerifyInteractionFactsError
>;
