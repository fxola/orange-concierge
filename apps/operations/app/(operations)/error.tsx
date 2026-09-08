'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page';
import { Text } from '@/components/ui/text';

export default function OperationsError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error('[operations] page error', error);
  }, [error]);

  return (
    <>
      <PageHeader title="Something went wrong" description="This page failed to load." />
      <Text tone="muted">Try again, or return to a known page. The failure is logged.</Text>
      <div className="mt-4 flex gap-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link
          href="/clients"
          className="inline-flex h-10 items-center justify-center rounded-none border border-border-strong bg-transparent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
        >
          Back to clients
        </Link>
      </div>
    </>
  );
}
