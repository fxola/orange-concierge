'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export default function AppError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('[operations] layout error', error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <Text variant="h1">Something went wrong</Text>
        <Text tone="muted" className="mb-5 mt-1">
          This section failed to load. The failure is logged.
        </Text>
        <div className="flex justify-center gap-2">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-none border border-border-strong bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </main>
  );
}
