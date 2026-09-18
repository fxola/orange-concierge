import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import type { AuditAction } from '../../src';
import {
  listAuditEventsWorld,
  type ListAuditEventsResult,
} from '../support/worlds/listAuditEventsWorld';

const feature = await loadFeature('tests/features/list-audit-events.feature');

describeFeature(feature, ({ Scenario }) => {
  Scenario('Reviewer views recent audit events newest-first', ({ Given, When, Then }) => {
    const world = listAuditEventsWorld();
    let result: ListAuditEventsResult;

    Given('interaction submitted, reviewed, and edited audit events exist', () => {
      world.givenAuditEvents();
    });

    When('the reviewer views audit events', async () => {
      result = await world.listAuditEvents().execute({
        actor: world.reviewer(),
        limit: 10,
        offset: 0,
      });
    });

    Then('audit events are returned newest-first', () => {
      expect(result.isSuccess()).toBe(true);
      if (!result.isSuccess()) expect.fail('Expected audit events');
      expect(result.getValue().map((event) => event.action)).toEqual([
        'recommendation_edited',
        'recommendation_reviewed',
        'interaction_submitted',
      ]);
    });
  });

  Scenario('Admin can view audit events', ({ Given, When, Then }) => {
    const world = listAuditEventsWorld();
    let result: ListAuditEventsResult;

    Given('interaction submitted, reviewed, and edited audit events exist', () => {
      world.givenAuditEvents();
    });

    When('the admin views audit events', async () => {
      result = await world.listAuditEvents().execute({
        actor: world.admin(),
        limit: 10,
        offset: 0,
      });
    });

    Then('all three audit events are returned', () => {
      expect(result.isSuccess()).toBe(true);
      if (!result.isSuccess()) expect.fail('Expected audit events');
      expect(result.getValue()).toHaveLength(3);
    });
  });

  Scenario('Consultant cannot view audit events', ({ Given, When, Then, And }) => {
    const world = listAuditEventsWorld();
    let result: ListAuditEventsResult;
    let readerSpy: ReturnType<typeof vi.spyOn>;

    Given('interaction submitted, reviewed, and edited audit events exist', () => {
      world.givenAuditEvents();
      readerSpy = vi.spyOn(world.audit(), 'list');
    });

    When('the consultant views audit events', async () => {
      result = await world.listAuditEvents().execute({
        actor: world.consultant(),
        limit: 10,
        offset: 0,
      });
    });

    Then('unauthorized audit view failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected unauthorized failure');
      expect(result.getError().code).toBe('unauthorized_audit_view');
    });

    And('no audit events are read', () => {
      expect(readerSpy).not.toHaveBeenCalled();
    });
  });

  Scenario('Action filter narrows audit events', ({ Given, When, Then }) => {
    const world = listAuditEventsWorld();
    let result: ListAuditEventsResult;

    Given('interaction submitted, reviewed, and edited audit events exist', () => {
      world.givenAuditEvents();
    });

    When('the reviewer views audit events filtered by recommendation reviewed', async () => {
      result = await world.listAuditEvents().execute({
        actor: world.reviewer(),
        action: 'recommendation_reviewed',
        limit: 10,
        offset: 0,
      });
    });

    Then('only the recommendation reviewed event is returned', () => {
      expect(result.isSuccess()).toBe(true);
      if (!result.isSuccess()) expect.fail('Expected audit events');
      expect(result.getValue().map((event) => event.action)).toEqual(['recommendation_reviewed']);
    });
  });

  Scenario('Invalid pagination fails', ({ Given, When, Then, And }) => {
    const world = listAuditEventsWorld();
    let result: ListAuditEventsResult;
    let readerSpy: ReturnType<typeof vi.spyOn>;

    Given('interaction submitted, reviewed, and edited audit events exist', () => {
      world.givenAuditEvents();
      readerSpy = vi.spyOn(world.audit(), 'list');
    });

    When('the reviewer views audit events with invalid pagination', async () => {
      result = await world.listAuditEvents().execute({
        actor: world.reviewer(),
        limit: 0,
        offset: 0,
      });
    });

    Then('invalid pagination failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected pagination failure');
      expect(result.getError().code).toBe('invalid_pagination');
    });

    And('no audit events are read', () => {
      expect(readerSpy).not.toHaveBeenCalled();
    });
  });

  Scenario('Invalid action filter fails', ({ Given, When, Then, And }) => {
    const world = listAuditEventsWorld();
    let result: ListAuditEventsResult;
    let readerSpy: ReturnType<typeof vi.spyOn>;

    Given('interaction submitted, reviewed, and edited audit events exist', () => {
      world.givenAuditEvents();
      readerSpy = vi.spyOn(world.audit(), 'list');
    });

    When('the reviewer views audit events with an invalid action filter', async () => {
      result = await world.listAuditEvents().execute({
        actor: world.reviewer(),
        action: 'bogus-action' as AuditAction,
        limit: 10,
        offset: 0,
      });
    });

    Then('invalid audit filter failure is returned', () => {
      expect(result.isFailure()).toBe(true);
      if (!result.isFailure()) expect.fail('Expected filter failure');
      expect(result.getError().code).toBe('invalid_audit_filter');
    });

    And('no audit events are read', () => {
      expect(readerSpy).not.toHaveBeenCalled();
    });
  });
});
