import { Result } from '../result';
import {
  InvalidKnowledgeSearchLimitError,
  InvalidKnowledgeSearchQueryError,
} from '../../errors';
import type {
  SearchKnowledgeDependencies,
  SearchKnowledgeInput,
  SearchKnowledgeResult,
} from './types';

export class SearchKnowledge {
  constructor(private readonly deps: SearchKnowledgeDependencies) {}

  async execute(input: SearchKnowledgeInput): Promise<SearchKnowledgeResult> {
    if (!input.query.trim()) {
      return Result.failure(new InvalidKnowledgeSearchQueryError());
    }

    if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 20) {
      return Result.failure(new InvalidKnowledgeSearchLimitError());
    }

    const results = await this.deps.KnowledgeRetriever.search(input);

    return Result.success({ results });
  }
}
