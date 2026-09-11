import type { ReactNode } from 'react';
import { Text } from '@/components/ui/text';
import type { ExtractedFacts } from '@orange-concierge/core';

function FactChip({ value }: Readonly<{ value: string }>) {
  return (
    <span className="inline-flex max-w-full rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-foreground">
      {value}
    </span>
  );
}

function FactGroup({
  eyebrow,
  title,
  children,
}: Readonly<{ eyebrow: string; title: string; children: ReactNode }>) {
  return (
    <section className="min-w-0">
      <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
        {eyebrow}
      </Text>
      <Text variant="label" className="mt-1 block">
        {title}
      </Text>
      <div className="mt-3 grid gap-3">{children}</div>
    </section>
  );
}

function FactText({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="min-w-0">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="small" className="mt-0.5">
        {value}
      </Text>
    </div>
  );
}

function FactList({ label, values }: Readonly<{ label: string; values: readonly string[] }>) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0">
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.map((value) => (
          <FactChip key={value} value={value} />
        ))}
      </div>
    </div>
  );
}

function hasFacts(facts: ExtractedFacts): boolean {
  return Boolean(facts.custody || facts.cybersecurity || facts.planning);
}

export function ExtractedFactsView({ facts }: Readonly<{ facts: ExtractedFacts }>) {
  if (!hasFacts(facts)) {
    return (
      <div className="rounded-sm border border-dashed border-border px-4 py-3">
        <Text variant="small" tone="muted">
          No structured facts were extracted from this transcript.
        </Text>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-border p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
          Extracted assessment
        </Text>
        <span className="shrink-0 text-xs text-subtle-foreground">Review before using</span>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {facts.custody ? (
          <FactGroup title="Custody" eyebrow="Client assets">
            {facts.custody.currentArrangement ? (
              <FactText label="Current arrangement" value={facts.custody.currentArrangement} />
            ) : null}
            {facts.custody.assetsDiscussed ? (
              <FactList label="Assets discussed" values={facts.custody.assetsDiscussed} />
            ) : null}
            {facts.custody.concerns ? (
              <FactList label="Concerns" values={facts.custody.concerns} />
            ) : null}
          </FactGroup>
        ) : null}
        {facts.cybersecurity ? (
          <FactGroup title="Cybersecurity" eyebrow="Controls and risks">
            {facts.cybersecurity.controls ? (
              <FactList label="Controls" values={facts.cybersecurity.controls} />
            ) : null}
            {facts.cybersecurity.risks ? (
              <FactList label="Risks" values={facts.cybersecurity.risks} />
            ) : null}
            {facts.cybersecurity.incidentHistory ? (
              <FactText label="Incident history" value={facts.cybersecurity.incidentHistory} />
            ) : null}
          </FactGroup>
        ) : null}
        {facts.planning ? (
          <FactGroup title="Planning" eyebrow="Next actions">
            {facts.planning.goals ? <FactList label="Goals" values={facts.planning.goals} /> : null}
            {facts.planning.constraints ? (
              <FactList label="Constraints" values={facts.planning.constraints} />
            ) : null}
            {facts.planning.nextSteps ? (
              <FactList label="Next steps" values={facts.planning.nextSteps} />
            ) : null}
          </FactGroup>
        ) : null}
      </div>
    </div>
  );
}
