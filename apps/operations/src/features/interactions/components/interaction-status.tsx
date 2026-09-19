import type { InteractionRow } from '../view-models/interactions';

const STATUS_META: Record<
  InteractionRow['status'],
  Readonly<{ label: string; dot: string; text: string }>
> = {
  received: { label: 'Needs analysis', dot: 'bg-info', text: 'text-info' },
  analysis_completed: { label: 'Complete', dot: 'bg-success', text: 'text-success' },
  analysis_blocked: { label: 'Blocked', dot: 'bg-danger', text: 'text-danger' },
};

export function InteractionStatus({ status }: Readonly<{ status: InteractionRow['status'] }>) {
  const meta = STATUS_META[status];

  return (
    <span className="inline-flex items-center gap-1.5 font-medium">
      <span aria-hidden="true" className={['h-1.5 w-1.5 rounded-full', meta.dot].join(' ')} />
      <span className={meta.text}>{meta.label}</span>
    </span>
  );
}
