import { Alert } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { InteractionRow } from '../../../view-models/interactions';
import { ExtractedFactsView } from './extracted-facts-view';

export function AnalysisPanel({
  row,
  canVerifyFacts,
}: Readonly<{ row: InteractionRow; canVerifyFacts: boolean }>) {
  if (row.status === 'analysis_completed') {
    return (
      <div className="grid gap-4">
        <ExtractedFactsView
          interactionId={row.id}
          facts={row.extractedFacts ?? {}}
          verifiedFactPaths={row.verifiedFactPaths}
          readinessScore={row.readinessScore}
          canVerifyFacts={canVerifyFacts}
        />
      </div>
    );
  }

  if (row.status === 'received') {
    return (
      <div className="rounded-sm border border-border bg-surface p-5 shadow-xs sm:p-6">
        <Text variant="small" tone="muted">
          Analysis has not run yet. Use Analyze interaction at the top of the page to continue.
        </Text>
      </div>
    );
  }

  return (
    <Alert tone="danger" className="rounded-sm">
      Analysis was blocked because sensitive material was detected.
    </Alert>
  );
}
