import {
  GetClient,
  ListClientReviewSummaries,
  ListClients,
  type Actor,
  type ClientReviewSummary,
  type ClientReviewSummaryRepository,
} from '../../../src';
import { InMemoryClientRepository } from '../in-memory-adapters/inMemoryClientAdapter';

const fixedDate = new Date('2026-09-03T00:00:00.000Z');

const consultant: Actor = {
  id: 'consultant-1',
  role: 'consultant',
};

class InMemoryClientReviewSummaryRepository implements ClientReviewSummaryRepository {
  calls: readonly string[][] = [];
  summaries: ClientReviewSummary[] = [
    {
      clientId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      totalInteractions: 23,
      needsAnalysis: 21,
      completed: 1,
      blocked: 1,
      latestInteractionAt: new Date('2026-09-04T00:00:00.000Z'),
    },
    {
      clientId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      totalInteractions: 0,
      needsAnalysis: 0,
      completed: 0,
      blocked: 0,
    },
  ];

  async listForClients(clientIds: readonly string[]): Promise<readonly ClientReviewSummary[]> {
    this.calls = [...this.calls, [...clientIds]];
    const requested = new Set(clientIds);
    return this.summaries.filter((summary) => requested.has(summary.clientId));
  }
}

const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`${name} should be set`);
  }

  return value;
};

export function viewClientsWorld() {
  const clientRepository = new InMemoryClientRepository();
  const clientReviewSummaryRepository = new InMemoryClientReviewSummaryRepository();
  clientRepository.clients.push(
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', displayName: 'Acme', createdAt: fixedDate },
    { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', displayName: 'TBW', createdAt: fixedDate }
  );
  const listClients = new ListClients({ clientRepository });
  const listClientReviewSummaries = new ListClientReviewSummaries({
    clientReviewSummaryRepository,
  });
  const getClient = new GetClient({ clientRepository });

  return {
    consultant() {
      return consultant;
    },

    knownClientIds() {
      return clientRepository.clients.map((client) => client.id);
    },

    firstClientId() {
      return required(clientRepository.clients[0], 'firstClient').id;
    },

    unknownClientId() {
      return 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    },

    paddedFirstClientId() {
      return `  ${required(clientRepository.clients[0], 'firstClient').id}  `;
    },

    overlongClientId() {
      return `client-${'x'.repeat(128)}`;
    },

    listClients() {
      return listClients;
    },

    listClientReviewSummaries() {
      return listClientReviewSummaries;
    },

    getClient() {
      return getClient;
    },

    clients() {
      return clientRepository.clients;
    },

    clientRepository() {
      return clientRepository;
    },

    clientReviewSummaryRepository() {
      return clientReviewSummaryRepository;
    },
  };
}
