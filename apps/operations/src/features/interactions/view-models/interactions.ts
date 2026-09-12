import 'server-only';

import type {
  ExtractedFacts,
  Interaction,
  InteractionStatus,
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

function toInteractionRow(interaction: Interaction): InteractionRow {
  const { extractedFacts } = interaction;

  return {
    id: interaction.id,
    status: interaction.status,
    statusLabel: STATUS_LABELS[interaction.status],
    createdAtLabel: formatDateLabel(interaction.createdAt),
    transcript: interaction.transcript,
    ...(extractedFacts
      ? { extractedFacts, readinessScore: calculateReadinessScore(extractedFacts) }
      : {}),
  };
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
