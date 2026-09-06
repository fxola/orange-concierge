import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Alert, Badge, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { PageHeader, Table, TableBody, TableEmpty, TableHead } from '@/components/ui/page';
import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

const SWATCHES: ReadonlyArray<{ token: string; value: string; className: string }> = [
  { token: 'background', value: '#f7f4ed', className: 'bg-background' },
  { token: 'surface', value: '#fffaf2', className: 'bg-surface' },
  { token: 'surface-raised', value: '#ffffff', className: 'bg-surface-raised' },
  { token: 'surface-muted', value: '#ece7de', className: 'bg-surface-muted' },
  { token: 'foreground', value: '#000f1a', className: 'bg-foreground' },
  { token: 'primary', value: '#eb8500', className: 'bg-primary' },
  { token: 'primary-hover', value: '#d97700', className: 'bg-primary-hover' },
  { token: 'primary-active', value: '#c56f00', className: 'bg-primary-active' },
  { token: 'secondary', value: '#000f1a', className: 'bg-secondary' },
  { token: 'success', value: '#176b4a', className: 'bg-success' },
  { token: 'warning', value: '#8a4b08', className: 'bg-warning' },
  { token: 'danger', value: '#b42318', className: 'bg-danger' },
  { token: 'info', value: '#175cd3', className: 'bg-info' },
];

const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
const BADGE_TONES = ['neutral', 'success', 'warning', 'danger', 'info'] as const;
const ALERT_TONES = ['success', 'warning', 'danger', 'info'] as const;

const SAMPLE_ROWS = [
  {
    client: 'Acme Fund',
    status: 'success' as const,
    statusLabel: 'Received',
    detail: '14 interactions',
  },
  {
    client: 'TBW',
    status: 'warning' as const,
    statusLabel: 'Pending review',
    detail: '3 interactions',
  },
  {
    client: 'Origami',
    status: 'info' as const,
    statusLabel: 'Analyzing',
    detail: '8 interactions',
  },
];

const AVATAR_NAMES = ['Acme Fund', 'TBW', 'Origami', 'Test Admin', 'Test Reviewer'];

function Section({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="grid gap-4" aria-label={title}>
      <Text variant="h2">{title}</Text>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="w-full px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Design System"
        description="Every variant below renders the live primitives — this page is the visual contract."
        action={<ThemeToggle />}
      />
      <div className="grid gap-10">
        <Section title="Colors">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {SWATCHES.map((swatch) => (
              <div
                key={swatch.token}
                className="overflow-hidden rounded-md border border-border bg-surface"
              >
                <div className={`h-16 ${swatch.className}`} />
                <div className="px-3 py-2">
                  <Text variant="caption">{swatch.token}</Text>
                  <Text variant="caption" tone="muted">
                    {swatch.value}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <Card className="grid gap-3">
            <Text variant="display">Display serif 40/48</Text>
            <Text variant="h1">Page title serif 32/40</Text>
            <Text variant="h2">Section heading 24/32</Text>
            <Text variant="h3">Subsection heading 20/28</Text>
            <Text>Body 16/24 — the quick brown fox jumps over the lazy dog.</Text>
            <Text variant="small">
              Small body 14/20 — the quick brown fox jumps over the lazy dog.
            </Text>
            <Text variant="label">Label 14/20 semibold</Text>
            <Text variant="caption" tone="muted">
              Caption 12/16 medium, muted
            </Text>
            <Text variant="small" tone="muted">
              Muted and <a href="/design-system">linked</a> text for comparison.
            </Text>
          </Card>
        </Section>

        <Section title="Buttons">
          <Card className="grid gap-5">
            {BUTTON_VARIANTS.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-3">
                <Text
                  as="span"
                  variant="caption"
                  tone="muted"
                  className="w-20 uppercase tracking-wide"
                >
                  {variant}
                </Text>
                {BUTTON_SIZES.map((size) => (
                  <Button key={size} variant={variant} size={size}>
                    {size === 'sm'
                      ? 'Action'
                      : size === 'md'
                        ? 'Submit interaction'
                        : 'Confirm recommendation'}
                  </Button>
                ))}
                <Button variant={variant} disabled>
                  Disabled
                </Button>
              </div>
            ))}
          </Card>
        </Section>

        <Section title="Forms">
          <Card className="grid max-w-xl gap-4">
            <Field label="Email" description="Use your Orange Concierge account.">
              <Input
                type="email"
                placeholder="you@company.com"
                defaultValue="admin@orangeconcierge.test"
              />
            </Field>
            <Field label="Password" error="Invalid email or password">
              <Input type="password" defaultValue="not-the-password" />
            </Field>
            <Field
              label="Transcript"
              description="Plain text. Do not include passwords or secrets."
            >
              <Textarea placeholder="Paste the interaction transcript here…" rows={4} />
            </Field>
            <Field label="Disabled">
              <Input disabled defaultValue="Read-only value" />
            </Field>
          </Card>
        </Section>

        <Section title="Badges">
          <Card className="flex flex-wrap gap-2">
            {BADGE_TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone === 'neutral'
                  ? 'Submitted'
                  : tone === 'success'
                    ? 'Approved'
                    : tone === 'warning'
                      ? 'Pending review'
                      : tone === 'danger'
                        ? 'Rejected'
                        : 'Analyzing'}
              </Badge>
            ))}
            <Badge tone="neutral">Admin</Badge>
            <Badge tone="info">Consultant</Badge>
          </Card>
        </Section>

        <Section title="Alerts">
          <div className="grid max-w-2xl gap-3">
            {ALERT_TONES.map((tone) => (
              <Alert key={tone} tone={tone}>
                {tone === 'success'
                  ? 'Interaction recorded with its audit event.'
                  : tone === 'warning'
                    ? 'Transcript may contain sensitive data. Review it before submitting.'
                    : tone === 'danger'
                      ? 'Submission failed: transcript is blank.'
                      : 'Analysis runs after secret screening passes.'}
              </Alert>
            ))}
          </div>
        </Section>

        <Section title="Avatars">
          <Card className="flex flex-wrap items-center gap-4">
            {AVATAR_NAMES.map((name) => (
              <span key={name} className="inline-flex items-center gap-2">
                <Avatar name={name} />
                <Text as="span" variant="small" tone="muted">
                  {name}
                </Text>
              </span>
            ))}
            <span className="inline-flex items-center gap-2">
              <Avatar name="Acme Fund" size="sm" />
              <Text as="span" variant="small" tone="muted">
                Small
              </Text>
            </span>
          </Card>
        </Section>

        <Section title="Table">
          <Table>
            <TableHead>
              <th>Client</th>
              <th>Status</th>
              <th>Detail</th>
            </TableHead>
            <TableBody>
              {SAMPLE_ROWS.map((row) => (
                <tr key={row.client}>
                  <td className="font-medium text-foreground">{row.client}</td>
                  <td>
                    <Badge tone={row.status}>{row.statusLabel}</Badge>
                  </td>
                  <td className="text-muted-foreground">{row.detail}</td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section title="Empty state">
          <div className="overflow-hidden rounded-none border border-border bg-surface">
            <TableEmpty
              title="No interactions yet"
              description="Submit your first client interaction to get started."
              action={<Button size="sm">Submit interaction</Button>}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
