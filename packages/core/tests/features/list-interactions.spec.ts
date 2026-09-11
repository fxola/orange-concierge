import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import type { ListInteractionsResult } from '../../src';
import { listInteractionsWorld } from '../support/worlds/listInteractionsWorld';

const feature = await loadFeature('tests/features/list-interactions.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario("Consultant lists a client's interactions", ({ Given, And, When, Then }) => {
    const world = listInteractionsWorld();
    let result: ListInteractionsResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    And('a client with interactions from another client mixed in', () => {
      expect(world.interactions()).toHaveLength(3);
    });

    When("the consultant lists the client's interactions", async () => {
      result = await world.listInteractions().execute({
        actor: world.consultant(),
        clientId: world.clientId(),
        limit: 20,
        offset: 0,
      });
    });

    Then("only that client's interactions are returned", () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().map((interaction) => interaction.id)).toEqual(
        world.clientInteractionIds()
      );
    });
  });

  Scenario('Consultant lists interactions for an unknown client', ({ Given, When, Then }) => {
    const world = listInteractionsWorld();
    let result: ListInteractionsResult;

    Given('a consultant actor', () => {
      expect(world.consultant().role).toBe('consultant');
    });

    When('the consultant lists interactions for an unknown client', async () => {
      result = await world.listInteractions().execute({
        actor: world.consultant(),
        clientId: world.unknownClientId(),
        limit: 20,
        offset: 0,
      });
    });

    Then('the request is rejected as client not found', () => {
      expect(result.isFailure()).toBe(true);
      expect(result.getError().name).toBe('ClientNotFoundError');
    });
  });

  Scenario(
    'Reject blank client id without touching the repository',
    ({ Given, When, Then, And }) => {
      const world = listInteractionsWorld();
      let result: ListInteractionsResult;
      let existsSpy: ReturnType<typeof vi.spyOn>;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        existsSpy = vi.spyOn(world.clientRepository(), 'exists');
      });

      When('the consultant lists interactions for a blank client id', async () => {
        result = await world.listInteractions().execute({
          actor: world.consultant(),
          clientId: '   ',
          limit: 20,
          offset: 0,
        });
      });

      Then('the request is rejected as invalid client id', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidClientIdError');
      });

      And('the client repository is never queried', () => {
        expect(existsSpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario(
    'Reject invalid pagination without touching the repository',
    ({ Given, When, Then, And }) => {
      const world = listInteractionsWorld();
      let result: ListInteractionsResult;
      let existsSpy: ReturnType<typeof vi.spyOn>;

      Given('a consultant actor', () => {
        expect(world.consultant().role).toBe('consultant');
        existsSpy = vi.spyOn(world.clientRepository(), 'exists');
      });

      When('the consultant lists interactions with invalid pagination', async () => {
        result = await world.listInteractions().execute({
          actor: world.consultant(),
          clientId: world.clientId(),
          limit: 0,
          offset: -1,
        });
      });

      Then('the request is rejected as invalid pagination', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError().name).toBe('InvalidPaginationError');
      });

      And('the client repository is never queried', () => {
        expect(existsSpy).not.toHaveBeenCalled();
      });
    }
  );
});
