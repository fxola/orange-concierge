'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';

export function MobileNav({
  onClose,
  userRole,
}: Readonly<{ onClose: () => void; userRole?: string }>) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
    >
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={[
          'absolute inset-0 cursor-default bg-black/50 transition-opacity duration-200 ease-cubic',
          entered ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      <div
        className={[
          'absolute inset-y-0 left-0 w-60 max-w-[85vw] transition-transform duration-250 ease-cubic',
          entered ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar collapsed={false} onNavigate={onClose} userRole={userRole} />
      </div>
    </div>
  );
}
