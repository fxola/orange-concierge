export { AnalyzeInteraction } from './application/interaction/analyze-interaction';
export { GetInteraction } from './application/interaction/get-interaction';
export { ListInteractions } from './application/interaction/list-interactions';
export { SubmitInteraction } from './application/interaction/submit-interaction';
export { SearchKnowledge } from './application/knowledge/search-knowledge';
export { GenerateRecommendations } from './application/recommendation/generate-recommendations';
export { ListClients } from './application/client/list-clients';
export { GetClient } from './application/client/get-client';
export {
  MAX_LIST_LIMIT,
  clientIdSchema,
  paginationSchema,
  parseClientId,
  parsePagination,
} from './application/client/client-id';
export { canViewClients } from './application/client/policy';
export {
  canAnalyzeInteractions,
  canSubmitInteractions,
  canViewInteractions,
} from './application/interaction/policy';
export {
  extractedFactsSchema,
  parseExtractedFacts,
} from './application/interaction/extracted-facts';
export { calculateReadinessScore } from './domain/readiness-score';
export { Result } from './application/result';

export {
  BlankTranscriptError,
  ClientNotFoundError,
  InvalidClientIdError,
  InvalidKnowledgeSearchLimitError,
  InvalidKnowledgeSearchQueryError,
  InvalidPaginationError,
  UnauthorizedViewClientsError,
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InteractionSubmissionFailedError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
  UnauthorizedSubmitInteractionError,
  UnauthorizedError,
} from './errors';
export type {
  AnalyzeInteractionDependencies,
  AnalyzeInteractionError,
  AnalyzeInteractionInput,
  AnalyzeInteractionResult,
  AnalyzeInteractionSuccess,
  GetInteractionDependencies,
  GetInteractionError,
  GetInteractionInput,
  GetInteractionResult,
  ListInteractionsDependencies,
  ListInteractionsError,
  ListInteractionsInput,
  ListInteractionsResult,
  SubmitInteractionDependencies,
  SubmitInteractionError,
  SubmitInteractionInput,
  SubmitInteractionResult,
} from './application/interaction/types';
export type {
  EvidenceReference,
  ExtractedFacts,
  ParseExtractedFactsResult,
} from './application/interaction/extracted-facts';
export type {
  GetClientDependencies,
  GetClientError,
  GetClientInput,
  GetClientResult,
  ListClientsDependencies,
  ListClientsError,
  ListClientsInput,
  ListClientsResult,
} from './application/client/types';
export type {
  SearchKnowledgeDependencies,
  SearchKnowledgeError,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
  SearchKnowledgeSuccess,
} from './application/knowledge/types';
export type {
  GenerateRecommendationsDependencies,
  GenerateRecommendationsError,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
  GenerateRecommendationsSuccess,
  GroundedRecommendation,
} from './application/recommendation/types';
export type { Actor, ActorRole } from './domain/actor';
export { isActorRole } from './domain/actor';
export type { Client } from './domain/client';
export type { Interaction, InteractionStatus } from './domain/interaction';
export type { ReadinessLevel, ReadinessScore, ReadinessScoreBand } from './domain/readiness-score';
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
export type {
  KnowledgeRetriever,
  KnowledgeSearchHit,
  KnowledgeSearchRequest,
} from './ports/knowledge-retriever';
export type {
  DraftRecommendation,
  RecommendationDrafter,
  RecommendationDraftingFailureReason,
  RecommendationDraftingInput,
  RecommendationDraftingResult,
  RecommendationPriority,
} from './ports/recommendation-drafter';
export type { ClientRepository } from './ports/client-repository';
export type {
  TransactionManager,
  TransactionalInteractionWriter,
  TransactionalPorts,
} from './ports/transaction-manager';
export type {
  SecretFinding,
  SecretFindingType,
  SecretScannerAPI,
  SecretScanResult,
} from './ports/secret-scanner';
export type {
  ExtractAssessmentFailureReason,
  ExtractAssessmentResult,
  StructuredLLMInput,
  StructuredLLM,
} from './ports/structured-llm';
