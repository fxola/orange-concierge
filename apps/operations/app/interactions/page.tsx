import { headers } from 'next/headers';
import { AppShell } from '../../src/components/app-shell';
import { PageHeader, TableEmpty } from '../../src/components/ui/page';
import { getCurrentActor } from '../../src/server/session';
import { getSidebarCollapsed } from '../../src/server/sidebar';

export default async function InteractionsPage() {
  const [actor, sidebarCollapsed] = await Promise.all([
    getCurrentActor(await headers()),
    getSidebarCollapsed(),
  ]);

  return (
    <AppShell userEmail={actor?.id} userRole={actor?.role} sidebarCollapsed={sidebarCollapsed}>
      <PageHeader
        title="Interactions"
        description="Submitted transcripts and their analysis state."
      />
      <div className="overflow-hidden rounded-none border border-border bg-surface">
        <TableEmpty
          title="No interactions yet"
          description="Submit your first client interaction to get started."
        />
      </div>
    </AppShell>
  );
}
