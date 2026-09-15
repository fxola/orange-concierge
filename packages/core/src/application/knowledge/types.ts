import type { KnowledgeRetriever, KnowledgeSearchHit } from '../../ports/knowledge-retriever';
import type {
  InvalidKnowledgeSearchLimitError,
  InvalidKnowledgeSearchQueryError,
} from '../../errors';
import type { Result } from '../result';

export type SearchKnowledgeInput = Readonly<{
  query: string;
  limit: number;
}>;

export type SearchKnowledgeDependencies = Readonly<{
  KnowledgeRetriever: KnowledgeRetriever;
}>;

export type SearchKnowledgeSuccess = Readonly<{
  results: readonly KnowledgeSearchHit[];
}>;

export type SearchKnowledgeError =
  | InvalidKnowledgeSearchQueryError
  | InvalidKnowledgeSearchLimitError;

export type SearchKnowledgeResult = Result<SearchKnowledgeSuccess, SearchKnowledgeError>;
