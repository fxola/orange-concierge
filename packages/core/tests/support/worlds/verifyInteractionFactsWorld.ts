import {
  VerifyInteractionFacts,
  type Actor,
  type Interaction,
  type VerifyInteractionFactsResult,
} from '../../../src';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';
import { InMemoryInteractionRepository } from '../in-memory-adapters/inMemoryInteractionRepository';
import { InMemoryTransactionManager } from '../in-memory-adapters/inMemoryTransactionManager';

export type { VerifyInteractionFactsResult };

const fixedDate = new Date('2026-09-19T12:00:00.000Z');

const consultant: Actor = { id: 'consultant-1', role: 'consultant' };
const reviewer: Actor = { id: 'reviewer-1', role: 'reviewer' };

const interactionId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const clientId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const arrangementQuote = 'two-of-three multisignature wallet';
const controlQuote = 'SMS recovery is disabled where providers permit it';

function analyzedInteraction(verifiedFactPaths?: readonly string[]): Interaction {
  return {
    id: interactionId,
    clientId,
    submittedBy: consultant.id,
    status: 'analysis_completed',
    transcript: `Client uses a ${arrangementQuote}. ${controlQuote}.`,
    createdAt: fixedDate,
    extractedFacts: {
      custody: {
        currentArrangement: 'Client uses a two-of-three multisignature wallet.',
      },
      cybersecurity: {
        controls: ['SMS recovery is disabled where providers permit it'],
        risks: ['SMS fallback still active'],
      },
      evidence: [
        {
          factPath: 'cybersecurity.controls[0]',
          quote: controlQuote,
          startOffset: 0,
          endOffset: controlQuote.length,
        },
      ],
    },
    ...(verifiedFactPaths ? { verifiedFactPaths: [...verifiedFactPaths] } : {}),
  };
}

export function verifyInteractionFactsWorld() {
  let current: Interaction | null = analyzedInteraction();
  let interactionsRepo = new InMemoryInteractionRepository(current);
  const audit = new RecordingAudit();
  let transactionManager = new InMemoryTransactionManager(interactionsRepo, audit);
  let verifyFacts = new VerifyInteractionFacts({
    interactionsRepo,
    audit,
    transactionManager,
    now: () => fixedDate,
  });

  const composeFixture = (next: Interaction | null) => {
    current = next;
    audit.events.length = 0;
    interactionsRepo = new InMemoryInteractionRepository(next);
    transactionManager = new InMemoryTransactionManager(interactionsRepo, audit);
    verifyFacts = new VerifyInteractionFacts({
      interactionsRepo,
      audit,
      transactionManager,
      now: () => fixedDate,
    });
  };

  return {
    givenAnalyzedInteraction() {
      composeFixture(analyzedInteraction());
    },

    givenAnalyzedInteractionWithVerifiedFact() {
      composeFixture(analyzedInteraction(['custody.currentArrangement']));
    },

    givenReceivedInteraction() {
      composeFixture({ ...analyzedInteraction(), status: 'received' });
    },

    givenMissingInteraction() {
      composeFixture(null);
    },

    interaction() {
      const stored = interactionsRepo.getCurrent();
      if (!stored) {
        throw new Error('interaction should be set');
      }

      return stored;
    },

    interactionId() {
      return interactionId;
    },

    consultant() {
      return consultant;
    },

    reviewer() {
      return reviewer;
    },

    verifyFacts() {
      return verifyFacts;
    },

    audit() {
      return audit;
    },

    interactionsRepo() {
      return interactionsRepo;
    },

    failTransactionalAuditRecording() {
      transactionManager.failNextTransactionalAudit();
    },
  };
}
