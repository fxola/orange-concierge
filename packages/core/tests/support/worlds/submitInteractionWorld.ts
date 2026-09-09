import { SubmitInteraction, type Actor } from '../../../src';
import { InMemoryClientRepository } from '../in-memory-adapters/inMemoryClientAdapter';
import { RecordingAudit } from '../in-memory-adapters/inMemoryAuditPort';
import { InMemoryInteractionRepository } from '../in-memory-adapters/inMemoryInteractionRepository';
import { InMemoryTransactionManager } from '../in-memory-adapters/inMemoryTransactionManager';

const meetingNotes = [
  'Consultant: Hi Sarah, thanks for joining today. You wanted to discuss moving bitcoin off the exchange?',
  'Client: Yes. I have held about 0.5 BTC on Coinbase for a few years, but I want to learn self-custody before buying more.',
  'Consultant: Great. We can start with a hardware wallet plan, backup practice, and an inheritance follow-up.',
].join('\n');

const fixedDate = new Date('2026-09-03T00:00:00.000Z');

const consultant: Actor = {
  id: 'consultant-1',
  role: 'consultant',
};

const reviewer: Actor = {
  id: 'reviewer-1',
  role: 'reviewer',
};

const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`${name} should be set`);
  }

  return value;
};

export function submitInteractionWorld() {
  const interactionsRepo = new InMemoryInteractionRepository(null);
  const auditRecorder = new RecordingAudit();
  const transactionManager = new InMemoryTransactionManager(interactionsRepo, auditRecorder);
  const clientRepository = new InMemoryClientRepository();
  clientRepository.clients.push({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    displayName: 'Test Client',
    createdAt: fixedDate,
  });
  const submitInteraction = new SubmitInteraction({
    transactionManager,
    clientRepository,
    newInteractionId: () => 'interaction-1',
    now: () => fixedDate,
  });

  return {
    consultant() {
      return consultant;
    },

    reviewer() {
      return reviewer;
    },

    clientId() {
      return 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    },

    meetingNotes() {
      return meetingNotes;
    },

    blankTranscript() {
      return '';
    },

    whitespaceTranscript() {
      return '   \n\t  ';
    },

    submitInteraction() {
      return submitInteraction;
    },

    savedInteraction() {
      return required(interactionsRepo.interactions[0], 'savedInteraction');
    },

    audit() {
      return auditRecorder;
    },

    interactions() {
      return interactionsRepo.interactions;
    },

    failAuditRecording() {
      auditRecorder.failRecording();
    },

    interactionsRepo() {
      return interactionsRepo;
    },

    transactionManager() {
      return transactionManager;
    },

    clientRepository() {
      return clientRepository;
    },
  };
}
