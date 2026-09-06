import Link from 'next/link';
import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle';
import { Badge } from '../ui/card';

export function TopBar({
  userId,
  userRole,
  onMenuClick,
  children,
}: Readonly<{
  userId?: string;
  userRole?: string;
  onMenuClick?: () => void;
  children?: ReactNode;
}>) {
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3 sm:px-8">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors duration-150 ease-cubic hover:bg-surface-muted md:hidden"
          >
            <span aria-hidden="true" className="inline-flex">
              <Menu size={20} strokeWidth={1.8} />
            </span>
          </button>
        ) : null}
        <div className="min-w-0 flex-1">{children}</div>
        <div className="flex shrink-0 items-center gap-2">
          {userId ? (
            <>
              <span className="hidden items-center gap-2 sm:inline-flex">
                {userRole ? <Badge tone="neutral">{userRole}</Badge> : null}
              </span>
              <ThemeToggle />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
