import { Text } from '@/components/ui/text';
import type { InteractionRow } from '../../view-models/interactions';
import { ExtractedFactsView } from '../extracted-facts-view';
import { DetailSection } from './detail-section';

function TranscriptSection({ transcript }: Readonly<{ transcript: string }>) {
  return (
    <DetailSection title="Transcript" description="Full meeting notes for this interaction.">
      <Text variant="small" className="whitespace-pre-wrap">
        {transcript}
      </Text>
    </DetailSection>
  );
}

function AnalysisSection({ row }: Readonly<{ row: InteractionRow }>) {
  if (row.status === 'analysis_completed') {
    return (
      <DetailSection
        title="Analysis"
        description="Extracted facts, readiness, and transcript evidence."
        defaultOpen
      >
        <ExtractedFactsView
          facts={row.extractedFacts ?? {}}
          transcript={row.transcript}
          readinessScore={row.readinessScore}
        />
      </DetailSection>
    );
  }

  if (row.status === 'received') {
    return (
      <DetailSection title="Analysis" description="Run analysis to extract structured facts.">
        <Text variant="small" tone="muted">
          Analysis has not run yet. Use the action at the top of the page when you are ready.
        </Text>
      </DetailSection>
    );
  }

  return null;
}

export function InteractionDetailSections({ row }: Readonly<{ row: InteractionRow }>) {
  return (
    <div className="mt-5 grid gap-4">
      <TranscriptSection transcript={row.transcript} />
      <AnalysisSection row={row} />
    </div>
  );
}
