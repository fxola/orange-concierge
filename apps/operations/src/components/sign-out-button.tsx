'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function SignOutButton({ collapsed }: Readonly<{ collapsed?: boolean }>) {
  const router = useRouter();

  const onClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          router.refresh();
        },
      },
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Sign out"
      title={collapsed ? 'Sign out' : undefined}
      className={[
        'flex items-center rounded-none py-2 text-sm transition-colors duration-150 ease-cubic',
        'text-[#f7f4ed]/70 hover:bg-white/5 hover:text-white cursor-pointer',
        collapsed ? 'px-[14px]' : 'px-3',
      ].join(' ')}
    >
      <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center">
        <LogOut size={18} strokeWidth={1.8} />
      </span>
      <span
        aria-hidden={collapsed}
        className={[
          'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-cubic',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-44 opacity-100',
        ].join(' ')}
      >
        Sign out
      </span>
    </button>
  );
}
