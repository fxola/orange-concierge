import type { ReadinessLevel } from '@orange-concierge/core';
import { Alert, Badge } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { InteractionRow } from '../../view-models/interactions';
import { collectFactItems, hasExtractedFacts } from './analysis-panel/fact-model';

function readinessLabel(level: ReadinessLevel): string {
  if (level === 'ready') {
    return 'Ready';
  }

  if (level === 'developing') {
    return 'Developing';
  }

  return 'Needs attention';
}

function readinessTone(level: ReadinessLevel): 'success' | 'warning' | 'danger' {
  if (level === 'ready') {
    return 'success';
  }

  if (level === 'developing') {
    return 'warning';
  }

  return 'danger';
}

function nextAction(row: InteractionRow): string {
  if (row.status === 'received') {
    return 'Run analysis to extract structured facts before recommendations.';
  }

  if (row.status === 'analysis_blocked') {
    return 'Remove prohibited secret material, then resubmit safe notes.';
  }

  return 'Review the extracted facts, then generate grounded recommendations.';
}

export function SummaryPanel({ row }: Readonly<{ row: InteractionRow }>) {
  const facts = row.extractedFacts ?? {};
  const factItems = hasExtractedFacts(facts) ? collectFactItems(facts) : [];
  const sourcedCount = factItems.filter((item) => item.evidence).length;
  const highlights = factItems.slice(0, 4);
  const readiness = row.readinessScore?.overall;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
      <section className="rounded-sm border border-border bg-surface p-5 shadow-xs sm:p-6">
        <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
          Operational brief
        </Text>
        <h2 className="mt-1 font-display text-2xl font-medium leading-8 tracking-[-0.015em]">
          What matters from this interaction
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          This summary is derived from extracted facts and evidence. It gives you a quick glance
          before drilling into the tabs.
        </p>

        {highlights.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {highlights.map((item) => (
              <div
                key={item.path}
                className="grid items-center gap-2 rounded-sm border border-border bg-background/70 px-3 py-3 sm:grid-cols-[150px_minmax(0,1fr)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {item.label}
                </span>
                <p className="text-sm font-medium leading-6 text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-sm border border-dashed border-border px-4 py-5 text-sm leading-6 text-muted-foreground">
            No extracted facts are available yet.
          </div>
        )}
      </section>

      <aside className="grid content-start gap-3">
        <section className="rounded-sm border border-border bg-surface p-5 shadow-xs">
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            Readiness
          </Text>
          {readiness ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="font-display text-3xl font-medium leading-9">
                {readiness.score}
                <span className="text-lg text-muted-foreground">/100</span>
              </p>
              <Badge tone={readinessTone(readiness.level)}>{readinessLabel(readiness.level)}</Badge>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Not scored yet.</p>
          )}
        </section>

        <section className="rounded-sm border border-border bg-surface p-5 shadow-xs">
          <Text variant="caption" tone="muted" className="uppercase tracking-[0.12em]">
            Evidence coverage
          </Text>
          <p className="mt-2 font-display text-2xl font-medium leading-8">
            {sourcedCount}/{factItems.length}
          </p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            facts have transcript proof
          </p>
        </section>

        <Alert tone={row.status === 'analysis_blocked' ? 'danger' : 'info'} className="rounded-sm">
          {nextAction(row)}
        </Alert>
      </aside>
    </div>
  );
}
