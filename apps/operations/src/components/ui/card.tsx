import type { ReactNode } from 'react';

export function Card({
  className,
  children,
}: Readonly<{ className?: string; children: ReactNode }>) {
  return (
    <section
      className={[
        'rounded-none border border-border bg-surface p-6 shadow-xs',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </section>
  );
}

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-foreground',
  success: 'bg-success-surface text-success',
  warning: 'bg-warning-surface text-warning',
  danger: 'bg-danger-surface text-danger',
  info: 'bg-info-surface text-info',
};

export function Badge({
  tone = 'neutral',
  icon,
  className,
  children,
}: Readonly<{ tone?: BadgeTone; icon?: ReactNode; className?: string; children: ReactNode }>) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        BADGE_TONES[tone],
        className ?? '',
      ].join(' ')}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

export function Alert({
  tone = 'info',
  className,
  children,
}: Readonly<{ tone?: Exclude<BadgeTone, 'neutral'>; className?: string; children: ReactNode }>) {
  return (
    <div
      role="alert"
      className={[
        'rounded-none border px-3 py-2.5 text-sm',
        tone === 'success' && 'border-success bg-success-surface text-success',
        tone === 'warning' && 'border-warning bg-warning-surface text-warning',
        tone === 'danger' && 'border-danger bg-danger-surface text-danger',
        tone === 'info' && 'border-info bg-info-surface text-info',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
