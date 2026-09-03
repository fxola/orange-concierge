import { SubmitInteraction, type Actor } from '../../../src';
import { InMemoryInteractionSubmissionStore } from '../in-memory-adapters/inMemoryInteractionSubmissionStore';

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
  const store = new InMemoryInteractionSubmissionStore();
  const submitInteraction = new SubmitInteraction({
    submissionStore: store,
    newInteractionId: () => 'interaction-1',
    now: () => fixedDate,
  });

  const audit = {
    get events() {
      return store.events;
    },
    failRecording() {
      store.failNextAudit();
    },
  } as const;

  return {
    consultant() {
      return consultant;
    },

    reviewer() {
      return reviewer;
    },

    clientId() {
      return 'client-1';
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
      return required(store.interactions[0], 'savedInteraction');
    },

    audit() {
      return audit;
    },

    interactions() {
      return store.interactions;
    },

    failAuditRecording() {
      store.failNextAudit();
    },

    submissionStore() {
      return store;
    },
  };
}
