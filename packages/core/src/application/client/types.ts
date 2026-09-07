import type { Actor } from '../../domain/actor';
import type { Client } from '../../domain/client';
import type {
  ClientNotFoundError,
  InvalidClientIdError,
  InvalidPaginationError,
  UnauthorizedViewClientsError,
} from '../../errors';
import type { ClientRepository } from '../../ports/client-repository';
import type { Result } from '../result';

export type ListClientsInput = Readonly<{
  actor: Actor;
  limit: number;
  offset: number;
}>;

export type ListClientsDependencies = Readonly<{
  clientRepository: ClientRepository;
}>;

export type ListClientsError = UnauthorizedViewClientsError | InvalidPaginationError;

export type ListClientsResult = Result<readonly Client[], ListClientsError>;

export type GetClientInput = Readonly<{
  actor: Actor;
  clientId: string;
}>;

export type GetClientDependencies = Readonly<{
  clientRepository: ClientRepository;
}>;

export type GetClientError =
  | UnauthorizedViewClientsError
  | InvalidClientIdError
  | ClientNotFoundError;

export type GetClientResult = Result<Client, GetClientError>;
