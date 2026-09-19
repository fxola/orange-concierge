import { Text } from '@/components/ui/text';

export function EmptyFacts() {
  return (
    <div className="grid justify-items-center gap-2 rounded-sm border border-dashed border-border px-4 py-6 text-center">
      <Text variant="small" tone="muted">
        No structured facts were extracted from this transcript.
      </Text>
    </div>
  );
}
