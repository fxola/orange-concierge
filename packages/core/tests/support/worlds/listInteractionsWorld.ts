import { ListInteractions, type Actor } from '../../../src';
import { InMemoryClientRepository } from '../in-memory-adapters/inMemoryClientAdapter';
import { InMemoryInteractionRepository } from '../in-memory-adapters/inMemoryInteractionRepository';

const fixedDate = new Date('2026-09-01T10:00:00.000Z');

const consultant: Actor = {
  id: 'consultant-1',
  role: 'consultant',
};

const CLIENT_ID = '98d4ea70-45e2-4c21-8767-3bbe0ae070a7';
const OTHER_CLIENT_ID = '3e2359ca-0b89-48b5-a1d2-d57bd3d0b4ef';

export function listInteractionsWorld() {
  const clientRepository = new InMemoryClientRepository();
  clientRepository.clients.push({ id: CLIENT_ID, displayName: 'Acme Fund', createdAt: fixedDate });

  const interactionsRepo = new InMemoryInteractionRepository(null);
  interactionsRepo.interactions.push(
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      clientId: CLIENT_ID,
      submittedBy: 'consultant-1',
      status: 'received',
      transcript: 'Meeting notes 1.',
      createdAt: fixedDate,
    },
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc',
      clientId: OTHER_CLIENT_ID,
      submittedBy: 'consultant-1',
      status: 'received',
      transcript: 'Meeting notes 2.',
      createdAt: fixedDate,
    },
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbd',
      clientId: CLIENT_ID,
      submittedBy: 'consultant-1',
      status: 'received',
      transcript: 'Meeting notes 3.',
      createdAt: fixedDate,
    }
  );

  const listInteractions = new ListInteractions({ clientRepository, interactionsRepo });

  return {
    consultant() {
      return consultant;
    },

    clientId() {
      return CLIENT_ID;
    },

    unknownClientId() {
      return '00000000-0000-4000-8000-000000000000';
    },

    clientInteractionIds() {
      return ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbd'];
    },

    listInteractions() {
      return listInteractions;
    },

    interactions() {
      return interactionsRepo.interactions;
    },

    clientRepository() {
      return clientRepository;
    },
  };
}
