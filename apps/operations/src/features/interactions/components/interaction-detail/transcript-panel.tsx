import { Text } from '@/components/ui/text';

export function TranscriptPanel({ transcript }: Readonly<{ transcript: string }>) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5 shadow-xs sm:p-6">
      <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
        Source transcript
      </Text>
      <Text
        variant="small"
        className="mt-4 whitespace-pre-wrap rounded-sm bg-background/70 p-4 leading-6"
      >
        {transcript}
      </Text>
    </div>
  );
}
