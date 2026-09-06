'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { Button } from './ui/button';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'oc-theme:v1';
const LEGACY_STORAGE_KEY = 'oc-theme';

const ICONS: Record<ThemePreference, { label: string; next: ThemePreference; icon: LucideIcon }> = {
  light: { label: 'Switch to dark mode', next: 'dark', icon: Moon },
  dark: { label: 'Follow system appearance', next: 'system', icon: Sun },
  system: { label: 'Switch to light mode', next: 'light', icon: Monitor },
};

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      // One-time migration from the unversioned key; the legacy entry is
      // removed so it can never shadow the versioned one.
      stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored !== null && localStorage.getItem(STORAGE_KEY) === null) {
        localStorage.setItem(STORAGE_KEY, stored);
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Private browsing etc. — fall through to the system default below.
    }
    const initial: ThemePreference =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setPreference(initial);
    applyTheme(initial);
    setMounted(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current === null || current === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = ICONS[preference].next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing etc. theme simply won't persist.
    }
    applyTheme(next);
    setPreference(next);
  };

  if (!mounted) {
    return null;
  }

  const { label, icon: Icon } = ICONS[preference];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <Icon size={18} strokeWidth={1.8} />
    </Button>
  );
}

function applyTheme(preference: ThemePreference): void {
  const effective =
    preference === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : preference;
  document.documentElement.dataset.theme = effective;
}
