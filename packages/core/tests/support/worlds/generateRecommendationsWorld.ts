import {
  GenerateRecommendations,
  type Actor,
  type DraftRecommendation,
  type GenerateRecommendationsResult,
  type GroundedRecommendation,
  type Interaction,
  type KnowledgeSearchHit,
} from '../../../src';
import { InMemoryInteractionRepository } from '../in-memory-adapters/inMemoryInteractionRepository';
import { InMemoryKnowledgeRetriever } from '../in-memory-adapters/inMemoryKnowledgeRetriever';
import { InMemoryRecommendationDrafter } from '../in-memory-adapters/inMemoryRecommendationDrafter';
import { InMemoryRecommendationRepository } from '../in-memory-adapters/inMemoryRecommendationRepository';
import { InMemoryRecommendationReviewTransactionManager } from '../in-memory-adapters/inMemoryRecommendationTransactionManager';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';

const fixedDate = new Date('2026-09-14T10:00:00.000Z');

const consultant: Actor = { id: 'consultant-1', role: 'consultant' };

const transcript = [
  'Client: I still hold bitcoin on Coinbase.',
  'Client: I want to move funds off exchange but I need a recovery plan first.',
  'Consultant: We should document hardware wallet controls before any move.',
].join('\n');

const knowledgeHit: KnowledgeSearchHit = {
  chunkId: 'knowledge/self-custody-readiness.md#1',
  sourceId: 'knowledge/self-custody-readiness.md',
  sourceTitle: 'Self-Custody Readiness Playbook',
  sourcePath: 'knowledge/self-custody-readiness.md',
  heading: 'Operational Readiness Signals',
  content: 'Recommend discovery before migration when custody concerns are unresolved.',
  score: 0.91,
};

const draftRecommendation: DraftRecommendation = {
  title: 'Run self-custody readiness discovery',
  summary: 'Confirm recovery planning and hardware-wallet controls before moving funds.',
  priority: 'high',
  clientEvidence: ['custody.currentArrangement', 'custody.concerns[0]'],
  knowledgeSources: [knowledgeHit.chunkId],
};

const draftWithUnknownKnowledge: DraftRecommendation = {
  ...draftRecommendation,
  knowledgeSources: ['knowledge/not-retrieved.md#0'],
};

const draftWithUnknownClientEvidence: DraftRecommendation = {
  ...draftRecommendation,
  clientEvidence: ['custody.notExtracted'],
};

const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`${name} should be set`);
  }

  return value;
};

function analyzedInteraction(): Interaction {
  const currentArrangementQuote = 'hold bitcoin on Coinbase';
  const custodyConcernQuote = 'need a recovery plan first';

  return {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    clientId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    submittedBy: consultant.id,
    status: 'analysis_completed',
    transcript,
    createdAt: fixedDate,
    extractedFacts: {
      custody: {
        currentArrangement: 'Client holds bitcoin on Coinbase.',
        concerns: ['Needs recovery plan before moving funds off exchange'],
      },
      cybersecurity: {
        controls: ['Hardware wallet controls should be documented'],
      },
      evidence: [
        {
          factPath: 'custody.currentArrangement',
          quote: currentArrangementQuote,
          startOffset: transcript.indexOf(currentArrangementQuote),
          endOffset: transcript.indexOf(currentArrangementQuote) + currentArrangementQuote.length,
        },
        {
          factPath: 'custody.concerns[0]',
          quote: custodyConcernQuote,
          startOffset: transcript.indexOf(custodyConcernQuote),
          endOffset: transcript.indexOf(custodyConcernQuote) + custodyConcernQuote.length,
        },
      ],
    },
  };
}

export function generateRecommendationsWorld() {
  const operations: string[] = [];
  const recommendationRepository = new InMemoryRecommendationRepository(null);
  const audit = new RecordingAudit();
  const transactionManager = new InMemoryRecommendationReviewTransactionManager(
    recommendationRepository,
    audit
  );
  let interactionsRepo: InMemoryInteractionRepository | undefined;
  let knowledgeRetriever: InMemoryKnowledgeRetriever | undefined;
  let recommendationDrafter: InMemoryRecommendationDrafter | undefined;
  let interaction: Interaction | undefined;

  return {
    givenAnalyzedInteractionWithEvidence() {
      interaction = analyzedInteraction();
      interactionsRepo = new InMemoryInteractionRepository(interaction);
    },

    givenRelevantInternalGuidanceIsRetrieved() {
      knowledgeRetriever = new InMemoryKnowledgeRetriever(operations, [knowledgeHit]);
    },

    givenRecommendationDrafterReturnsCitedRecommendation() {
      recommendationDrafter = new InMemoryRecommendationDrafter(operations, [draftRecommendation]);
    },

    givenRecommendationDrafterReturnsUnknownKnowledgeCitation() {
      recommendationDrafter = new InMemoryRecommendationDrafter(operations, [
        draftWithUnknownKnowledge,
      ]);
    },

    givenRecommendationDrafterReturnsUnknownClientEvidenceCitation() {
      recommendationDrafter = new InMemoryRecommendationDrafter(operations, [
        draftWithUnknownClientEvidence,
      ]);
    },

    givenRecommendationDrafterRequestFails() {
      recommendationDrafter = new InMemoryRecommendationDrafter(operations, [], 'request_failed');
    },

    generateRecommendations() {
      return new GenerateRecommendations({
        interactionsRepo: required(interactionsRepo, 'interactionsRepo'),
        knowledgeRetriever: required(knowledgeRetriever, 'knowledgeRetriever'),
        recommendationDrafter: required(recommendationDrafter, 'recommendationDrafter'),
        transactionManager,
        newRecommendationId: () => 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        now: () => fixedDate,
      });
    },

    operations() {
      return operations;
    },

    knowledgeRetriever() {
      return required(knowledgeRetriever, 'knowledgeRetriever');
    },

    recommendationDrafter() {
      return required(recommendationDrafter, 'recommendationDrafter');
    },

    transcript() {
      return transcript;
    },

    knowledgeHit() {
      return knowledgeHit;
    },

    consultant() {
      return consultant;
    },

    interaction() {
      return required(interaction, 'interaction');
    },

    recommendationRepository() {
      return recommendationRepository;
    },

    savedRecommendations() {
      return recommendationRepository.recommendations;
    },

    expectedPersistedDraftRecommendation() {
      const evidence = required(analyzedInteraction().extractedFacts?.evidence, 'evidence');

      return {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        clientId: analyzedInteraction().clientId,
        interactionId: analyzedInteraction().id,
        status: 'draft',
        title: draftRecommendation.title,
        summary: draftRecommendation.summary,
        rationale: draftRecommendation.summary,
        priority: draftRecommendation.priority,
        clientEvidence: evidence,
        knowledgeCitations: [knowledgeHit],
        createdAt: fixedDate,
      };
    },

    expectedGroundedRecommendations(): readonly GroundedRecommendation[] {
      const evidence = required(analyzedInteraction().extractedFacts?.evidence, 'evidence');

      return [
        {
          id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
          title: draftRecommendation.title,
          summary: draftRecommendation.summary,
          priority: draftRecommendation.priority,
          clientEvidence: evidence,
          knowledgeCitations: [knowledgeHit],
        },
      ];
    },

    expectedNoGroundedRecommendations(): readonly GroundedRecommendation[] {
      return [];
    },
  };
}
