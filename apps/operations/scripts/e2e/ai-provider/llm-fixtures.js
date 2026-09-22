// Deterministic E2E responses for the containerized AI provider.
//
// The review transcript is defined once here. The spec imports it to fill the
// intake form, and the container serves assessment/recommendation payloads
// whose evidence quotes are exact substrings of that transcript.

export const EMBEDDING_MODEL = 'nomic-embed-text';
export const EMBEDDING_DIMENSIONS = 768;

export function fixedEmbedding() {
  return new Array(EMBEDDING_DIMENSIONS).fill(0.25);
}

const QUOTE_ARRANGEMENT = 'Acme Fund holds bitcoin on a single exchange account.';
const QUOTE_CONCERN = 'The client wants to move funds into self-custody with a hardware wallet.';
const QUOTE_RISK = 'SMS recovery is enabled on the exchange account and worries the client.';
const QUOTE_NEXT_STEP = 'The client agreed to schedule a backup verification session next week.';

export const REVIEW_TRANSCRIPT = [
  `E2E review notes: ${QUOTE_ARRANGEMENT}`,
  QUOTE_CONCERN,
  QUOTE_RISK,
  QUOTE_NEXT_STEP,
].join('\n');

export const REVIEW_ASSESSMENT = {
  custody: {
    currentArrangement: {
      text: 'Client holds bitcoin on a single exchange account.',
      quote: QUOTE_ARRANGEMENT,
    },
    concerns: [
      {
        text: 'Client wants to move funds into self-custody.',
        quote: QUOTE_CONCERN,
      },
    ],
  },
  cybersecurity: {
    risks: [
      {
        text: 'SMS recovery is enabled on the exchange account.',
        quote: QUOTE_RISK,
      },
    ],
  },
  planning: {
    nextSteps: [
      {
        text: 'Client agreed to schedule a backup verification session.',
        quote: QUOTE_NEXT_STEP,
      },
    ],
  },
};

export const REVIEW_RECOMMENDATION_CHUNK_ID = 'knowledge/self-custody-basics.md#0';

export const REVIEW_RECOMMENDATION_DRAFTS = {
  recommendations: [
    {
      title: 'Move funds into hardware wallet self-custody',
      summary:
        'The client holds bitcoin on an exchange and wants self-custody with less counterparty risk.',
      priority: 'medium',
      clientEvidence: ['custody.concerns[0]', 'custody.currentArrangement'],
      knowledgeSources: [REVIEW_RECOMMENDATION_CHUNK_ID],
    },
  ],
};
