import { Text } from '@/components/ui/text';

export function ExtractedFactValue({ value }: Readonly<{ value: string }>) {
  return (
    <div className="grid gap-1">
      <Text className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        Extracted fact
      </Text>
      <Text className="max-w-prose text-sm font-semibold leading-6 text-foreground">{value}</Text>
    </div>
  );
}
