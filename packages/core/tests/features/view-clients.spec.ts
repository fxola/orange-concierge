import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import type {
  Client,
  GetClientResult,
  ListClientReviewSummariesResult,
  ListClientsResult,
} from '../../src';
import { viewClientsWorld } from '../support/worlds/viewClientsWorld';

const feature = await loadFeature('tests/features/view-clients.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Consultant lists clients', ({ Given, And, When, Then }) => {
    const world = viewClientsWorld();
    let result: ListClientsResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    And('two known clients exist', () => {
      expect(world.clients()).toHaveLength(2);
    });

    When('the consultant lists clients', async () => {
      result = await world
        .listClients()
        .execute({ actor: world.consultant(), limit: 20, offset: 0 });
    });

    Then('both clients are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().map((client) => client.id)).toEqual(world.knownClientIds());
    });
  });

  Scenario('Consultant lists client review summaries', ({ Given, And, When, Then }) => {
    const world = viewClientsWorld();
    let result: ListClientReviewSummariesResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    And('two known clients exist', () => {
      expect(world.clients()).toHaveLength(2);
    });

    When('the consultant lists review summaries for known clients', async () => {
      result = await world.listClientReviewSummaries().execute({
        actor: world.consultant(),
        clientIds: [world.firstClientId(), world.firstClientId(), world.knownClientIds()[1] ?? ''],
      });
    });

    Then('exact review summaries are returned', () => {
      expect(result.isSuccess()).toBe(true);
      expect(world.clientReviewSummaryRepository().calls).toEqual([world.knownClientIds()]);
      expect(result.getValue()).toEqual([
        expect.objectContaining({
          clientId: world.firstClientId(),
          totalInteractions: 23,
          needsAnalysis: 21,
          completed: 1,
          blocked: 1,
        }),
        expect.objectContaining({
          clientId: world.knownClientIds()[1],
          totalInteractions: 0,
          needsAnalysis: 0,
          completed: 0,
          blocked: 0,
        }),
      ]);
    });
  });

  Scenario(
    'Reject invalid review summary client id without touching the repository',
    ({ Given, And, When, Then }) => {
      const world = viewClientsWorld();
      let result: ListClientReviewSummariesResult;
      let summarySpy: ReturnType<typeof vi.spyOn>;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        summarySpy = vi.spyOn(world.clientReviewSummaryRepository(), 'listForClients');
      });

      And('two known clients exist', () => {
        expect(world.clients()).toHaveLength(2);
      });

      When('the consultant lists review summaries with an invalid client id', async () => {
        result = await world.listClientReviewSummaries().execute({
          actor: world.consultant(),
          clientIds: [world.firstClientId(), 'not-a-uuid'],
        });
      });

      Then('the request is rejected as invalid client id', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidClientIdError');
      });

      And('the client review summary repository is never queried', () => {
        expect(summarySpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario('Consultant opens a known client', ({ Given, And, When, Then }) => {
    const world = viewClientsWorld();
    let result: GetClientResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    And('two known clients exist', () => {
      expect(world.clients()).toHaveLength(2);
    });

    When('the consultant opens the first client', async () => {
      result = await world
        .getClient()
        .execute({ actor: world.consultant(), clientId: world.firstClientId() });
    });

    Then('that client is returned', () => {
      expect(result.isSuccess()).toBe(true);
      const opened: Client = result.getValue();
      expect(opened.id).toBe(world.firstClientId());
      expect(opened.displayName).toBe('Acme');
    });
  });

  Scenario('Consultant opens an unknown client', ({ Given, And, When, Then }) => {
    const world = viewClientsWorld();
    let result: GetClientResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    And('two known clients exist', () => {
      expect(world.clients()).toHaveLength(2);
    });

    When('the consultant opens an unknown client', async () => {
      result = await world
        .getClient()
        .execute({ actor: world.consultant(), clientId: world.unknownClientId() });
    });

    Then('the request is rejected as client not found', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('ClientNotFoundError');
    });
  });

  Scenario(
    'Reject blank client id without touching the repository',
    ({ Given, And, When, Then }) => {
      const world = viewClientsWorld();
      let result: GetClientResult;
      let findSpy: ReturnType<typeof vi.spyOn>;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        findSpy = vi.spyOn(world.clientRepository(), 'findById');
      });

      And('two known clients exist', () => {
        expect(world.clients()).toHaveLength(2);
      });

      When('the consultant opens a blank client id', async () => {
        result = await world.getClient().execute({ actor: world.consultant(), clientId: '' });
      });

      Then('the request is rejected as invalid client id', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidClientIdError');
      });

      And('the client repository is never queried', () => {
        expect(findSpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario(
    'Reject whitespace-only client id without touching the repository',
    ({ Given, And, When, Then }) => {
      const world = viewClientsWorld();
      let findSpy: ReturnType<typeof vi.spyOn>;
      let result: GetClientResult;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        findSpy = vi.spyOn(world.clientRepository(), 'findById');
      });

      And('two known clients exist', () => {
        expect(world.clients()).toHaveLength(2);
      });

      When('the consultant opens a whitespace-only client id', async () => {
        result = await world
          .getClient()
          .execute({ actor: world.consultant(), clientId: '   \n\t  ' });
      });

      Then('the request is rejected as invalid client id', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidClientIdError');
      });

      And('the client repository is never queried', () => {
        expect(findSpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario(
    'Reject overlong client id without touching the repository',
    ({ Given, And, When, Then }) => {
      const world = viewClientsWorld();
      let result: GetClientResult;
      let findSpy: ReturnType<typeof vi.spyOn>;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        findSpy = vi.spyOn(world.clientRepository(), 'findById');
      });

      And('two known clients exist', () => {
        expect(world.clients()).toHaveLength(2);
      });

      When('the consultant opens an overlong client id', async () => {
        result = await world
          .getClient()
          .execute({ actor: world.consultant(), clientId: world.overlongClientId() });
      });

      Then('the request is rejected as invalid client id', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidClientIdError');
      });

      And('the client repository is never queried', () => {
        expect(findSpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario(
    'Reject invalid pagination without touching the repository',
    ({ Given, And, When, Then }) => {
      const world = viewClientsWorld();
      let result: ListClientsResult;
      let getAllSpy: ReturnType<typeof vi.spyOn>;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        getAllSpy = vi.spyOn(world.clientRepository(), 'getAll');
      });

      And('two known clients exist', () => {
        expect(world.clients()).toHaveLength(2);
      });

      When('the consultant lists clients with invalid pagination', async () => {
        result = await world
          .listClients()
          .execute({ actor: world.consultant(), limit: 0, offset: -1 });
      });

      Then('the request is rejected as invalid pagination', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidPaginationError');
      });

      And('the client repository is never queried', () => {
        expect(getAllSpy).not.toHaveBeenCalled();
      });
    }
  );
});
