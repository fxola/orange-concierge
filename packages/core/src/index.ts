export { AnalyzeInteraction } from './application/interaction/analyze-interaction';
export { SubmitInteraction } from './application/interaction/submit-interaction';
export { canAnalyzeInteractions, canSubmitInteractions } from './application/interaction/policy';
export { Result } from './application/interaction/result';

export {
  BlankTranscriptError,
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InteractionSubmissionFailedError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
  UnauthorizedSubmitInteractionError,
} from './errors';
export type {
  AnalyzeInteractionDependencies,
  AnalyzeInteractionError,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  SubmitInteractionDependencies,
  SubmitInteractionError,
  SubmitInteractionInput,
  SubmitInteractionResult,
} from './application/interaction/types';
export type { Actor, ActorRole } from './domain/actor';
export type { Client } from './domain/client';
export type { Interaction, InteractionStatus } from './domain/interaction';
export type { Recommendation, RecommendationStatus } from './domain/recommendation';
export type {
  AuditAction,
  AuditEvent,
  AuditMetadata,
  AuditMetadataValue,
  AuditPort,
  AuditResource,
  AuditResourceType,
} from './ports/audit';
export type { InteractionRepository } from './ports/interaction-repository';
export type { InteractionSubmissionStore } from './ports/interaction-submission-store';
export type {
  SecretFinding,
  SecretFindingType,
  SecretScanner,
  SecretScanResult,
} from './ports/secret-scanner';
export type { StructuredLLMInput, StructuredLLM } from './ports/structured-llm';
