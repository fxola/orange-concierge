import type { ReactNode } from 'react';
import { Text } from './text';

export function PageHeader({
  title,
  description,
  action,
}: Readonly<{ title: string; description?: string; action?: ReactNode }>) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text variant="h1">{title}</Text>
        </div>
        {action}
      </div>
    </div>
  );
}

export function Table({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-surface">
      <table
        className={[
          'w-full border-collapse text-sm',
          '[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3',
          '[&_tbody_tr:not(:first-child)]:border-t [&_tbody_tr:not(:first-child)]:border-border',
          '[&_tbody_tr]:transition-colors',
          className ?? '',
        ].join(' ')}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <thead className="bg-surface-muted">
      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground [&>th]:bg-surface-muted">
        {children}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: Readonly<{ children: ReactNode }>) {
  return <tbody className="[&_tr:hover]:bg-surface-muted/50 cursor-pointer">{children}</tbody>;
}

export function TableEmpty({
  title,
  description,
  action,
}: Readonly<{ title: string; description?: string; action?: ReactNode }>) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-12 text-center">
      <Text variant="h3">{title}</Text>
      {description ? (
        <Text variant="small" tone="muted" className="max-w-sm mb-4">
          {description}
        </Text>
      ) : null}
      {action}
    </div>
  );
}
