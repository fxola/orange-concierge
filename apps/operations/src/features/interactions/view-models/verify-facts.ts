import { ApiError } from '@/lib/api-client';

export type VerifyFactsViewModel =
  | Readonly<{ status: 'ok' }>
  | Readonly<{ status: 'error'; message: string; unauthorized: boolean }>;

function error(message: string, unauthorized = false): VerifyFactsViewModel {
  return { status: 'error', message, unauthorized };
}

export function toVerifyFactsErrorViewModel(failure: ApiError): VerifyFactsViewModel {
  if (failure.status === 401 || failure.code === 'unauthorized') {
    return error('Please sign in to verify facts.', true);
  }

  if (failure.status === 403 || failure.code === 'unauthorized_verify_facts') {
    return error('Your role cannot verify facts.', false);
  }

  if (failure.status === 404 || failure.code === 'interaction_not_found') {
    return error('That interaction no longer exists.', false);
  }

  if (failure.status === 409 || failure.code === 'invalid_interaction_state') {
    return error('Facts can only be verified after analysis completes.', false);
  }

  if (failure.code === 'invalid_fact_path') {
    return error('One of the selected facts is no longer valid. Refresh and try again.', false);
  }

  return error('Something went wrong while saving verification. Try again.', false);
}
