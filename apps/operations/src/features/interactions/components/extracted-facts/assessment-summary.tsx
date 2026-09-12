import { FileSearch } from 'lucide-react';
import { Badge } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export function EmptyFacts() {
  return (
    <div className="grid justify-items-center gap-2 rounded-sm border border-dashed border-border px-4 py-6 text-center">
      <FileSearch aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
      <Text variant="small" tone="muted">
        No structured facts were extracted from this transcript.
      </Text>
    </div>
  );
}

export function AssessmentSummary({
  total,
  sourced,
}: Readonly<{ total: number; sourced: number }>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
          Extracted assessment
        </Text>
        <h3 className="mt-1 font-display text-xl font-medium leading-7">
          Facts extracted from the transcript
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
          Each row is a claim from the transcript. Click any row to inspect the exact highlighted
          quote.
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
        <Badge tone={sourced >= total ? 'success' : 'warning'}>
          {sourced} of {total} sourced
        </Badge>
        <span className="text-xs text-subtle-foreground">Review before using</span>
      </div>
    </div>
  );
}
