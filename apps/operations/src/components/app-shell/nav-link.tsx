import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Text } from '../ui/text';

export function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: Readonly<{
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}>) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={[
        'relative flex items-center py-2 text-sm transition-colors duration-150 ease-cubic',
        collapsed ? 'px-[14px]' : 'px-3',
        active ? 'bg-white/10 text-white' : 'text-[#f7f4ed]/70 hover:bg-white/5 hover:text-white',
      ].join(' ')}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 left-0 top-0 w-0.5 bg-primary h-full"
        />
      ) : null}
      <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span
        aria-hidden={collapsed}
        className={[
          'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-cubic',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-44 opacity-100',
        ].join(' ')}
      >
        <Text as="span" variant="small" className="text-white ml-2">
          {label}
        </Text>
      </span>
    </Link>
  );
}
