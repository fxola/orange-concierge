import type { Actor } from '../../domain/actor';
import type { Interaction } from '../../domain/interaction';
import type { ExtractedFacts } from './extracted-facts';
import type {
  BlankTranscriptError,
  ClientNotFoundError,
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InteractionSubmissionFailedError,
  InvalidClientIdError,
  InvalidInteractionStateError,
  InvalidPaginationError,
  UnauthorizedAnalyzeInteractionError,
  UnauthorizedSubmitInteractionError,
  UnauthorizedViewClientsError,
} from '../../errors';
import type { AuditPort } from '../../ports/audit';
import type { ClientRepository } from '../../ports/client-repository';
import type { InteractionRepository } from '../../ports/interaction-repository';
import type { TransactionManager } from '../../ports/transaction-manager';
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
  transactionManager: TransactionManager;
  now: () => Date;
}>;

export type AnalyzeInteractionError =
  | UnauthorizedAnalyzeInteractionError
  | InteractionAnalysisFailedError
  | InteractionNotFoundError
  | InvalidInteractionStateError;

export type AnalyzeInteractionSuccess = Readonly<{
  interaction: Interaction;
  extractedFacts?: ExtractedFacts;
}>;

export type AnalyzeInteractionResult = Result<AnalyzeInteractionSuccess, AnalyzeInteractionError>;

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
  transactionManager: TransactionManager;
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
