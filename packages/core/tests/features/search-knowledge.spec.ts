import { expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';

import {
  InvalidKnowledgeSearchLimitError,
  InvalidKnowledgeSearchQueryError,
  SearchKnowledge,
  type KnowledgeSearchHit,
  type SearchKnowledgeResult,
} from '../../src';
import { InMemoryKnowledgeSearch } from '../support/in-memory-adapters/inMemoryKnowledgeSearch';

const feature = await loadFeature('tests/features/search-knowledge.feature');

const expectedHit: KnowledgeSearchHit = {
  chunkId: 'knowledge/self-custody-readiness.md#1',
  sourceId: 'knowledge/self-custody-readiness.md',
  sourceTitle: 'Self-Custody Readiness Playbook',
  sourcePath: 'knowledge/self-custody-readiness.md',
  heading: 'Operational Readiness Signals',
  content:
    'A client is ready for self-custody when approval, recovery, and monitoring are documented.',
  score: 0.92,
};

describeFeature(feature, ({ Scenario }) => {
  Scenario('Retrieve ranked guidance with source context', ({ Given, When, Then }) => {
    let KnowledgeRetriever: InMemoryKnowledgeSearch;
    let result: SearchKnowledgeResult;
    let searchSpy: ReturnType<typeof vi.spyOn>;
    Given('internal custody guidance has been indexed', () => {
      KnowledgeRetriever = new InMemoryKnowledgeSearch([expectedHit]);
      searchSpy = vi.spyOn(KnowledgeRetriever, 'search');
    });

    When('knowledge is searched for self-custody readiness', async () => {
      result = await new SearchKnowledge({ KnowledgeRetriever }).execute({
        query: 'self-custody readiness',
        limit: 3,
      });
    });

    Then('the matching guidance chunk is returned with source context', () => {
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().results).toEqual([expectedHit]);
      expect(searchSpy).toHaveBeenCalled();
      expect(searchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'self-custody readiness', limit: 3 })
      );
    });
  });

  Scenario(
    'Reject blank search query without touching the retriever',
    ({ Given, When, Then, And }) => {
      let KnowledgeRetriever: InMemoryKnowledgeSearch;
      let result: SearchKnowledgeResult;
      let searchSpy: ReturnType<typeof vi.spyOn>;

      Given('internal custody guidance has been indexed', () => {
        KnowledgeRetriever = new InMemoryKnowledgeSearch([expectedHit]);
        searchSpy = vi.spyOn(KnowledgeRetriever, 'search');
      });

      When('knowledge is searched with a blank query', async () => {
        result = await new SearchKnowledge({ KnowledgeRetriever }).execute({
          query: '   ',
          limit: 3,
        });
      });

      Then('the request is rejected as an invalid knowledge search query', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError()).toBeInstanceOf(InvalidKnowledgeSearchQueryError);
      });

      And('the knowledge retriever is never queried', () => {
        expect(searchSpy).not.toHaveBeenCalled();
      });
    }
  );

  Scenario(
    'Reject invalid result limit without touching the retriever',
    ({ Given, When, Then, And }) => {
      let KnowledgeRetriever: InMemoryKnowledgeSearch;
      let result: SearchKnowledgeResult;
      let searchSpy: ReturnType<typeof vi.spyOn>;

      Given('internal custody guidance has been indexed', () => {
        KnowledgeRetriever = new InMemoryKnowledgeSearch([expectedHit]);
        searchSpy = vi.spyOn(KnowledgeRetriever, 'search');
      });

      When('knowledge is searched with an invalid result limit', async () => {
        result = await new SearchKnowledge({ KnowledgeRetriever }).execute({
          query: 'self-custody readiness',
          limit: 0,
        });
      });

      Then('the request is rejected as an invalid knowledge search limit', () => {
        expect(result.isFailure()).toBe(true);
        expect(result.getError()).toBeInstanceOf(InvalidKnowledgeSearchLimitError);
      });

      And('the knowledge retriever is never queried', () => {
        expect(searchSpy).not.toHaveBeenCalled();
      });
    }
  );
});
