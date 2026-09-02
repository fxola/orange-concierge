export { AnalyzeInteraction } from './application/interaction';
export {
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
} from './errors';
export { canAnalyzeInteractions } from './application/interaction/policy';
export {
  type AnalyzeInteractionDependencies,
  type AnalyzeInteractionError,
  type AnalyzeInteractionInput,
  type AnalyzeInteractionResult,
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
export type { SecretFinding, SecretFindingType, SecretScanner, SecretScanResult } from './ports/secret-scanner';
export type { StructuredLLMInput, StructuredLLM } from './ports/structured-llm';
