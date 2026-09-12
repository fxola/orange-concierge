'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { TopBar } from './top-bar';
import { MobileNav } from './mobile-nav';
import { Sidebar } from './sidebar';
import { writeCollapsedCookie } from './sidebar-cookie';

export function AppShell({
  userEmail,
  userRole,
  sidebarCollapsed = false,
  children,
}: Readonly<{
  userEmail?: string;
  userRole?: string;
  sidebarCollapsed?: boolean;
  children: ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Initialized from the server-read cookie prop, so SSR and hydration
  // agree — no expand→collapse flash on navigation.
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleCollapse = () => {
    setCollapsed((previous) => {
      const next = !previous;
      writeCollapsedCookie(next);
      return next;
    });
  };

  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh shrink-0 md:block">
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} showCollapseToggle />
      </div>
      {menuOpen ? <MobileNav onClose={() => setMenuOpen(false)} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar userId={userEmail} userRole={userRole} onMenuClick={() => setMenuOpen(true)} />
        <div className="w-full flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
