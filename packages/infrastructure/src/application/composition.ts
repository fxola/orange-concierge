import { randomUUID } from 'node:crypto';

import {
  createRecommendationDrafter,
  createStructuredLLM,
  type AIConfig,
} from '@orange-concierge/ai';
import {
  AnalyzeInteraction,
  EditRecommendationDraft,
  GenerateRecommendations,
  GetInteraction,
  GetClient,
  ListClients,
  ListInteractions,
  ListRecommendations,
  ReviewRecommendation,
  SearchKnowledge,
  SubmitRecommendationForReview,
  SubmitInteraction,
  ListAuditEvents,
  VerifyInteractionFacts,
  AuditPort,
} from '@orange-concierge/core';
import { PatternSecretScanner } from '@orange-concierge/security';

import { DrizzleAuditPort } from '../adapters/audit/drizzle-audit-port';
import { DrizzleTransactionManager } from '../adapters/interaction/drizzle-transaction-manager';
import { DrizzleInteractionRepository } from '../adapters/interaction/drizzle-interaction-repository';
import { DrizzleRecommendationRepository } from '../adapters/recommendation/drizzle-recommendation-repository';
import { DrizzleRecommendationTransactionManager } from '../adapters/recommendation/drizzle-recommendation-transaction-manager';
import { createAuth } from '../auth';
import { createDatabaseFromUrl, OrangeConciergeDB } from '../database/connection';
import { config, type BackendConfig } from './config';
import type { Application } from './types';
import { DrizzleClientRepository } from '../adapters/client/drizzle-client-repository';
import { DrizzleKnowledgeSearch } from '../adapters/knowledge/drizzle-knowledge-search';
import { createKnowledgeEmbedder } from '../knowledge/embedder-factory';
import { input } from 'zod';

type ApplicationRuntime = Readonly<{
  application: Application;
  close: () => Promise<void>;
}>;

declare global {
  var __appRuntime: ApplicationRuntime | undefined;
}

const createApplicationRuntime = (runtimeConfig: BackendConfig): ApplicationRuntime => {
  const { db, client } = createDatabaseFromUrl(runtimeConfig.db.url);
  const baseURL = runtimeConfig.general.baseUrl;
  const secret = runtimeConfig.auth.secret;
  const trustedOrigins = runtimeConfig.auth.trustedOrigins;

  const clientRepository = new DrizzleClientRepository(db);
  const auditPort = new DrizzleAuditPort(db);

  const auth = createAuth({ db, baseURL, secret, trustedOrigins });
  const interaction = buildInteraction(db, clientRepository, auditPort, runtimeConfig.ai);
  const clients = buildClients(clientRepository);
  const knowledge = buildKnowledge(db, runtimeConfig.ai);
  const recommendations = buildRecommendations(db, runtimeConfig.ai);
  const audit = buildAuditEvents(auditPort);

  const application: Application = {
    auth,
    interaction,
    clients,
    knowledge,
    recommendations,
    audit,
  };

  return {
    application,
    close: () => client.end(),
  };
};

const buildInteraction = (
  db: OrangeConciergeDB,
  clientRepository: DrizzleClientRepository,
  audit: AuditPort,
  aiConfig: AIConfig
): Application['interaction'] => {
  const transactionManager = new DrizzleTransactionManager(db);

  const submitInteractionUseCase = new SubmitInteraction({
    transactionManager,
    clientRepository,
    newInteractionId: randomUUID,
    now: () => new Date(),
  });

  const interactionRepository = new DrizzleInteractionRepository(db);
  const secretScanner = new PatternSecretScanner();
  const structuredLLM = createStructuredLLM(aiConfig);

  const analyzeInteractionUseCase = new AnalyzeInteraction({
    interactionsRepo: interactionRepository,
    secretScanner,
    structuredLLM,
    audit,
    transactionManager,
    now: () => new Date(),
  });

  const listInteractionsUseCase = new ListInteractions({
    clientRepository,
    interactionsRepo: interactionRepository,
  });

  const getInteractionUseCase = new GetInteraction({ interactionsRepo: interactionRepository });

  const verifyInteractionFactsUseCase = new VerifyInteractionFacts({
    interactionsRepo: interactionRepository,
    audit,
    transactionManager,
    now: () => new Date(),
  });

  return {
    submit: (input) => submitInteractionUseCase.execute(input),
    analyze: (input) => analyzeInteractionUseCase.execute(input),
    getOne: (input) => getInteractionUseCase.execute(input),
    list: (input) => listInteractionsUseCase.execute(input),
    verifyFacts: (input) => verifyInteractionFactsUseCase.execute(input),
  };
};

const buildClients = (clientRepository: DrizzleClientRepository): Application['clients'] => {
  const listClientsUseCase = new ListClients({ clientRepository });
  const getClientUseCase = new GetClient({ clientRepository });
  return {
    getAll: (input) => listClientsUseCase.execute(input),
    getOne: (input) => getClientUseCase.execute(input),
  };
};

const buildKnowledge = (db: OrangeConciergeDB, aiConfig: AIConfig): Application['knowledge'] => {
  const KnowledgeRetriever = new DrizzleKnowledgeSearch(db, createKnowledgeEmbedder(aiConfig));
  const searchKnowledgeUseCase = new SearchKnowledge({ KnowledgeRetriever });

  return {
    search: (input) => searchKnowledgeUseCase.execute(input),
  };
};

const buildRecommendations = (
  db: OrangeConciergeDB,
  aiConfig: AIConfig
): Application['recommendations'] => {
  const interactionsRepo = new DrizzleInteractionRepository(db);
  const knowledgeRetriever = new DrizzleKnowledgeSearch(db, createKnowledgeEmbedder(aiConfig));
  const recommendationDrafter = createRecommendationDrafter(aiConfig);
  const recommendationRepository = new DrizzleRecommendationRepository(db);
  const transactionManager = new DrizzleRecommendationTransactionManager(db);
  const generateRecommendationsUseCase = new GenerateRecommendations({
    interactionsRepo,
    knowledgeRetriever,
    recommendationDrafter,
    transactionManager,
    newRecommendationId: randomUUID,
    now: () => new Date(),
  });
  const listRecommendationsUseCase = new ListRecommendations({
    recommendationRepository,
    interactionRepository: interactionsRepo,
  });

  const submitRecommendationForReviewUseCase = new SubmitRecommendationForReview({
    recommendationRepository,
  });

  const reviewRecommendationUseCase = new ReviewRecommendation({
    recommendationRepository,
    transactionManager,
    now: () => new Date(),
  });

  const editRecommendationDraftUseCase = new EditRecommendationDraft({
    recommendationRepository,
    transactionManager,
    now: () => new Date(),
  });

  return {
    generate: (input) => generateRecommendationsUseCase.execute(input),
    list: (input) => listRecommendationsUseCase.execute(input),
    submitForReview: (input) => submitRecommendationForReviewUseCase.execute(input),
    review: (input) => reviewRecommendationUseCase.execute(input),
    editDraft: (input) => editRecommendationDraftUseCase.execute(input),
  };
};

const buildAuditEvents = (audit: AuditPort): Application['audit'] => {
  const auditUseCase = new ListAuditEvents({ audit });
  return {
    list: (input) => auditUseCase.execute(input),
  };
};

/**
 * Process-level application singleton.
 *
 * Keeping the runtime on `globalThis` prevents duplicate database pools during
 * Next.js development/HMR. In production this results in one composed backend
 * runtime per Node.js process.
 *
 * `postgres()` connects lazily, so constructing the application does not open
 * a database socket until the first query.
 */
export const getApplication = (): Application => {
  const existing = globalThis.__appRuntime;

  if (existing) {
    return existing.application;
  }

  const runtime = createApplicationRuntime(config);

  globalThis.__appRuntime = runtime;

  return runtime.application;
};

/**
 * Test-only lifecycle seam.
 *
 * Intentionally not re-exported from the package root. Infrastructure tests
 * may import this module directly/relatively when they need to reset the
 * process singleton between test cases.
 */
export const resetApplicationForTests = async (): Promise<void> => {
  const runtime = globalThis.__appRuntime;

  globalThis.__appRuntime = undefined;

  if (runtime) {
    await runtime.close();
  }
};
