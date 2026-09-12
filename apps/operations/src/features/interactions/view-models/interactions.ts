import 'server-only';

import type {
  ExtractedFacts,
  Interaction,
  InteractionStatus,
  GetInteractionResult,
  ListInteractionsResult,
  ReadinessScore,
} from '@orange-concierge/core';
import { calculateReadinessScore } from '@orange-concierge/core';

import { formatDateLabel } from '@/features/clients/view-models/clients';

const STATUS_LABELS: Record<InteractionStatus, string> = {
  received: 'Received',
  analysis_completed: 'Analysis completed',
  analysis_blocked: 'Analysis blocked',
};

export type InteractionRow = Readonly<{
  id: string;
  clientId: string;
  status: InteractionStatus;
  statusLabel: string;
  createdAtLabel: string;
  transcript: string;
  extractedFacts?: ExtractedFacts;
  readinessScore?: ReadinessScore;
}>;

export type ClientInteractionsViewModel =
  | Readonly<{ status: 'ok'; rows: readonly InteractionRow[] }>
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'unavailable' }>;

export type InteractionDetailViewModel =
  | Readonly<{ status: 'ok'; row: InteractionRow }>
  | Readonly<{ status: 'notFound' }>
  | Readonly<{ status: 'unavailable' }>;

function toInteractionRow(interaction: Interaction): InteractionRow {
  const { extractedFacts } = interaction;

  return {
    id: interaction.id,
    clientId: interaction.clientId,
    status: interaction.status,
    statusLabel: STATUS_LABELS[interaction.status],
    createdAtLabel: formatDateLabel(interaction.createdAt),
    transcript: interaction.transcript,
    ...(extractedFacts
      ? { extractedFacts, readinessScore: calculateReadinessScore(extractedFacts) }
      : {}),
  };
}

export function toInteractionDetailViewModel(
  result: GetInteractionResult
): InteractionDetailViewModel {
  if (result.isFailure()) {
    const code = result.getError().code;

    if (code === 'interaction_not_found' || code === 'invalid_client_id') {
      return { status: 'notFound' };
    }

    return { status: 'unavailable' };
  }

  return { status: 'ok', row: toInteractionRow(result.getValue()) };
}

export function toClientInteractionsViewModel(
  result: ListInteractionsResult
): ClientInteractionsViewModel {
  if (result.isFailure()) {
    return { status: 'unavailable' };
  }

  const interactions = result.getValue();
  if (interactions.length === 0) {
    return { status: 'empty' };
  }

  return { status: 'ok', rows: interactions.map(toInteractionRow) };
}
