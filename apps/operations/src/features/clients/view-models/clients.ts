import 'server-only';

import type { Client, GetClientResult, ListClientsResult } from '@orange-concierge/core';

export type ClientRow = Readonly<{
  id: string;
  displayName: string;
  createdAtLabel: string;
}>;

export type ClientListViewModel =
  | Readonly<{ status: 'ok'; rows: readonly ClientRow[] }>
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'unavailable' }>;

export type ClientDetailViewModel =
  | Readonly<{ status: 'ok'; client: ClientRow }>
  | Readonly<{ status: 'notFound' }>
  | Readonly<{ status: 'unavailable' }>;

export function formatDateLabel(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toClientRow(client: Client): ClientRow {
  return {
    id: client.id,
    displayName: client.displayName,
    createdAtLabel: formatDateLabel(client.createdAt),
  };
}

export function toClientListViewModel(result: ListClientsResult): ClientListViewModel {
  if (result.isFailure()) {
    return { status: 'unavailable' };
  }

  const clients = result.getValue();
  if (clients.length === 0) {
    return { status: 'empty' };
  }

  return { status: 'ok', rows: clients.map(toClientRow) };
}

export function toClientDetailViewModel(result: GetClientResult): ClientDetailViewModel {
  if (result.isSuccess()) {
    return { status: 'ok', client: toClientRow(result.getValue()) };
  }

  const error = result.getError();
  const code = error.code;
  if (code === 'client_not_found' || code === 'invalid_client_id') {
    return { status: 'notFound' };
  }

  return { status: 'unavailable' };
}
