const AVATAR_PAIRS = [
  'bg-[#dbeafe] text-[#1e40af]',
  'bg-[#d1fae5] text-[#065f46]',
  'bg-[#fef3c7] text-[#92400e]',
  'bg-[#ffe4e6] text-[#9f1239]',
  'bg-[#ede9fe] text-[#5b21b6]',
  'bg-[#cffafe] text-[#155e75]',
  'bg-[#ffedd5] text-[#9a3412]',
  'bg-[#ecfccb] text-[#3f6212]',
] as const;

export function Avatar({ name, size = 'md' }: Readonly<{ name: string; size?: 'sm' | 'md' }>) {
  const initials = name
    .split(/[@\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const pair = AVATAR_PAIRS[hash % AVATAR_PAIRS.length];

  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        size === 'sm' ? 'h-6 w-6 text-[11px]' : 'h-8 w-8 text-xs',
        pair,
      ].join(' ')}
    >
      {initials}
    </span>
  );
}
