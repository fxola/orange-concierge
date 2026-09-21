export { AnalyzeInteraction } from './application/interaction/analyze-interaction';
export { GetInteraction } from './application/interaction/get-interaction';
export { ListInteractions } from './application/interaction/list-interactions';
export { SubmitInteraction } from './application/interaction/submit-interaction';
export { VerifyInteractionFacts } from './application/interaction/verify-interaction-facts';
export { SearchKnowledge } from './application/knowledge/search-knowledge';
export { ListAuditEvents } from './application/audit/list-audit-events';
export { GenerateRecommendations } from './application/recommendation/generate-recommendations';
export { EditRecommendationDraft } from './application/recommendation/edit-recommendation-draft';
export { ReviewRecommendation } from './application/recommendation/review-recommendation';
export { SubmitRecommendationForReview } from './application/recommendation/submit-recommendation-for-review';
export { ListRecommendations } from './application/recommendation/list-recommendations';
export { ListClients } from './application/client/list-clients';
export { ListClientReviewSummaries } from './application/client/list-client-review-summaries';
export { GetClient } from './application/client/get-client';
export { canViewClients } from './application/client/policy';
export { canViewAuditTrail } from './application/audit/policy';
export {
  canAnalyzeInteractions,
  canSubmitInteractions,
  canVerifyInteractionFacts,
  canViewInteractions,
} from './application/interaction/policy';
export {
  canEditRecommendationDrafts,
  canReviewRecommendations,
  canSubmitRecommendationsForReview,
} from './application/recommendation/policy';
export {
  assessmentModelOutputJsonSchema,
  extractedFactsSchema,
  parseExtractedFacts,
  calculateEvidenceCoverage,
  factPathsFor,
  LOW_EVIDENCE_COVERAGE_RATIO,
} from './domain/client-assessment-facts';
export { calculateReadinessScore } from './domain/readiness-score';
export { MIN_EVIDENCE_QUOTE_LENGTH } from './domain/recommendation';
export { parseRecommendationModelOutput } from './domain/recommendation/model-output';
export {
  recommendationModelOutputJsonSchema,
  recommendationModelOutputSchema,
} from './domain/recommendation/schemas';
export { Result } from './application/result';

export {
  BlankTranscriptError,
  ClientNotFoundError,
  InvalidClientIdError,
  InvalidInteractionIdError,
  InvalidAuditFilterError,
  InvalidKnowledgeSearchLimitError,
  InvalidKnowledgeSearchQueryError,
  InvalidPaginationError,
  InvalidRecommendationEditError,
  InvalidRecommendationIdError,
  UnauthorizedEditRecommendationError,
  UnauthorizedViewClientsError,
  InteractionAnalysisFailedError,
  InteractionNotFoundError,
  InvalidRecommendationTransitionError,
  RecommendationNotFoundError,
  RecommendationDraftingFailedError,
  RecommendationEditFailedError,
  RecommendationReviewFailedError,
  UnauthorizedReviewRecommendationError,
  UnauthorizedSubmitRecommendationForReviewError,
  InteractionSubmissionFailedError,
  InvalidInteractionStateError,
  UnauthorizedAnalyzeInteractionError,
  UnauthorizedSubmitInteractionError,
  UnauthorizedVerifyFactsError,
  InvalidFactPathError,
  FactVerificationFailedError,
  UnauthorizedViewAuditError,
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
  VerifyInteractionFactsDependencies,
  VerifyInteractionFactsError,
  VerifyInteractionFactsInput,
  VerifyInteractionFactsResult,
  VerifyInteractionFactsSuccess,
} from './application/interaction/types';
export type {
  EvidenceReference,
  ExtractedFacts,
  ParseExtractedFactsResult,
  EvidenceCoverage,
} from './domain/client-assessment-facts';
export type {
  GetClientDependencies,
  GetClientError,
  GetClientInput,
  GetClientResult,
  ListClientsDependencies,
  ListClientsError,
  ListClientsInput,
  ListClientsResult,
  ListClientReviewSummariesDependencies,
  ListClientReviewSummariesError,
  ListClientReviewSummariesInput,
  ListClientReviewSummariesResult,
} from './application/client/types';
export type {
  SearchKnowledgeDependencies,
  SearchKnowledgeError,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
  SearchKnowledgeSuccess,
} from './application/knowledge/types';
export type {
  ListAuditEventsDependencies,
  ListAuditEventsError,
  ListAuditEventsInput,
  ListAuditEventsResult,
} from './application/audit/types';
export type {
  GenerateRecommendationsDependencies,
  GenerateRecommendationsError,
  GenerateRecommendationsInput,
  GenerateRecommendationsResult,
  GenerateRecommendationsSuccess,
  EditRecommendationDraftDependencies,
  EditRecommendationDraftError,
  EditRecommendationDraftInput,
  EditRecommendationDraftPatch,
  EditRecommendationDraftResult,
  ListRecommendationsDependencies,
  ListRecommendationsInput,
  ListRecommendationsResult,
  ReviewRecommendationDecision,
  ReviewRecommendationDependencies,
  ReviewRecommendationError,
  ReviewRecommendationInput,
  ReviewRecommendationResult,
  SubmitRecommendationForReviewDependencies,
  SubmitRecommendationForReviewError,
  SubmitRecommendationForReviewInput,
  SubmitRecommendationForReviewResult,
} from './application/recommendation/types';
export type { Actor, ActorRole } from './domain/actor';
export { isActorRole } from './domain/actor';
export type { Client } from './domain/client';
export type { Interaction, InteractionStatus } from './domain/interaction';
export type { ReadinessLevel, ReadinessScore, ReadinessScoreBand } from './domain/readiness-score';
export type {
  Recommendation,
  RecommendationPriority,
  RecommendationStatus,
} from './domain/recommendation';
export type {
  GroundedRecommendation,
  RecommendationDraft,
} from './domain/recommendation/grounding';
export type {
  AuditEvent,
  AuditMetadata,
  AuditMetadataValue,
  AuditPort,
  AuditResource,
} from './ports/audit';
export { auditActions, auditResourceTypes, parseAuditEventFilter } from './domain/audit';
export type {
  AuditAction,
  AuditEventFilter,
  AuditEventPage,
  AuditResourceType,
} from './domain/audit';
export type { InteractionRepository } from './ports/interaction-repository';
export type { RecommendationRepository } from './ports/recommendation-repository';
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
} from './ports/recommendation-drafter';
export type { ClientRepository } from './ports/client-repository';
export type {
  ClientReviewSummary,
  ClientReviewSummaryRepository,
} from './ports/client-review-summary-repository';
export type {
  InteractionTransactionManager,
  InteractionTransactionalPorts,
  RecommendationTransactionManager,
  RecommendationTransactionalPorts,
  TransactionManager,
  TransactionalWriter,
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
