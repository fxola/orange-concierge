'use client';

import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SignOutButton } from '@/components/sign-out-button';
import { Button } from '@/components/ui/button';
import { BrandMark } from './brand-mark';
import { NAV_ITEMS } from './nav-items';
import { NavLink } from './nav-link';

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  showCollapseToggle,
}: Readonly<{
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
}>) {
  const pathname = usePathname();
  const ToggleIcon = collapsed ? ChevronsRight : ChevronsLeft;

  return (
    <aside
      className={[
        'flex h-full shrink-0 flex-col bg-[#000f1a] text-[#f7f4ed]',
        'transition-[width] duration-200 ease-cubic border-r border-white/10',
        collapsed ? 'w-[76px]' : 'w-60',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center gap-2 pb-6 pt-6 transition-[padding] duration-200 ease-cubic',
          collapsed ? 'justify-start px-[10px]' : 'justify-between px-5',
        ].join(' ')}
      >
        {collapsed ? null : <BrandMark collapsed={collapsed} />}
        {showCollapseToggle && onToggleCollapse ? (
          <Button
            type="button"
            variant="sidebar"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="shrink-0 rounded-none ml-2"
          >
            <ToggleIcon size={17} strokeWidth={1.8} />
          </Button>
        ) : null}
      </div>

      <nav aria-label="Primary" className="flex-1 px-3" onClick={onNavigate}>
        <ul className="grid gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-1 border-t border-white/10 px-3 py-4">
        <SignOutButton collapsed={collapsed} />
      </div>
    </aside>
  );
}
