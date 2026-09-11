const STEPS: ReadonlyArray<Readonly<{ step: string; title: string; hint: string }>> = [
  { step: '1', title: 'Capture intake', hint: 'Meeting notes land here unchanged.' },
  { step: '2', title: 'Security gate', hint: 'Secrets are blocked before any model.' },
  { step: '3', title: 'Review facts', hint: 'Confirm extraction before using it.' },
];

export function ReviewFlowCard() {
  return (
    <section className="rounded-sm border border-border bg-surface p-6">
      <h2 className="text-sm font-semibold">Review flow</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Every transcript follows the same path before advice leaves the firm.
      </p>
      <ol className="mt-4 grid gap-3">
        {STEPS.map((item) => (
          <li key={item.step} className="flex gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold"
            >
              {item.step}
            </span>
            <span>
              <span className="block text-sm font-medium">{item.title}</span>
              <span className="block text-sm text-muted-foreground">{item.hint}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
