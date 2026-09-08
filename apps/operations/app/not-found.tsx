import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <Text variant="h1">Page not found</Text>
        <Text tone="muted" className="mb-5 mt-1">
          That address does not exist or was moved.
        </Text>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-none bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
        >
          Back to home
        </Link>
      </Card>
    </main>
  );
}
