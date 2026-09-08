import Link from 'next/link';

import { PageHeader } from '@/components/ui/page';
import { Text } from '@/components/ui/text';

export default function ClientNotFound() {
  return (
    <>
      <PageHeader title="Client not found" description="No client record matches that id." />
      <Text tone="muted">The client may have been removed, or the link has a typo.</Text>
      <Link
        href="/clients"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-none bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active"
      >
        Back to clients
      </Link>
    </>
  );
}
