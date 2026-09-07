import { GetClient, ListClients, type Actor } from '../../../src';
import { InMemoryClientRepository } from '../in-memory-adapters/inMemoryClientAdapter';

const fixedDate = new Date('2026-09-03T00:00:00.000Z');

const consultant: Actor = {
  id: 'consultant-1',
  role: 'consultant',
};

const required = <T>(value: T | undefined, name: string): T => {
  if (value === undefined) {
    throw new Error(`${name} should be set`);
  }

  return value;
};

export function viewClientsWorld() {
  const clientRepository = new InMemoryClientRepository();
  clientRepository.clients.push(
    { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', displayName: 'Acme', createdAt: fixedDate },
    { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', displayName: 'TBW', createdAt: fixedDate }
  );
  const listClients = new ListClients({ clientRepository });
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

    getClient() {
      return getClient;
    },

    clients() {
      return clientRepository.clients;
    },

    clientRepository() {
      return clientRepository;
    },
  };
}
