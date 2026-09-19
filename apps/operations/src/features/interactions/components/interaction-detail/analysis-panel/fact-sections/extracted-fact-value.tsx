export function ExtractedFactValue({ value }: Readonly<{ value: string }>) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        Extracted fact
      </p>
      <p className="max-w-prose text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}
