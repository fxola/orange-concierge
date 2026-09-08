import { ApiError } from '@/lib/api-client';

export type ClientOption = Readonly<{
  id: string;
  displayName: string;
}>;

export type SubmitInteractionViewModel =
  | Readonly<{ status: 'ok'; interactionId: string }>
  | Readonly<{ status: 'error'; message: string; unauthorized: boolean }>;

function error(message: string, unauthorized = false): SubmitInteractionViewModel {
  return { status: 'error', message, unauthorized };
}

export function toSubmitErrorViewModel(failure: ApiError): SubmitInteractionViewModel {
  if (failure.status === 401 || failure.code === 'unauthorized') {
    return error('Please sign in to submit an interaction.', true);
  }

  if (failure.status === 403 || failure.code === 'forbidden') {
    return error('Your role cannot submit interactions.', false);
  }

  if (failure.status === 404 || failure.code === 'client_not_found') {
    return error('That client no longer exists. Pick another client.', false);
  }

  if (failure.code === 'blank_transcript') {
    return error('Transcript must not be blank.', false);
  }

  if (failure.code === 'invalid_input' || failure.code === 'invalid_json') {
    return error('Check the form and try again.', false);
  }

  return error('Something went wrong. Try again.', false);
}
