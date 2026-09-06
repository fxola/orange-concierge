import { headers } from 'next/headers';
import { AppShell } from '@/components/app-shell';
import { PageHeader, TableEmpty } from '@/components/ui/page';
import { getCurrentActor } from '@/server/session';
import { getSidebarCollapsed } from '@/server/sidebar';

export default async function ClientsPage() {
  const [actor, sidebarCollapsed] = await Promise.all([
    getCurrentActor(await headers()),
    getSidebarCollapsed(),
  ]);

  return (
    <AppShell userEmail={actor?.id} userRole={actor?.role} sidebarCollapsed={sidebarCollapsed}>
      <PageHeader title="Clients" description="Consultancy client records." />
      <div className="overflow-hidden rounded-none border border-border bg-surface">
        <TableEmpty title="No clients to show yet" description="Client records will appear here." />
      </div>
    </AppShell>
  );
}
