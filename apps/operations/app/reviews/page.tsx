import { headers } from 'next/headers';
import { AppShell } from '../../src/components/app-shell';
import { PageHeader, TableEmpty } from '../../src/components/ui/page';
import { getCurrentActor } from '../../src/server/session';
import { getSidebarCollapsed } from '../../src/server/sidebar';

export default async function ReviewsPage() {
  const [actor, sidebarCollapsed] = await Promise.all([
    getCurrentActor(await headers()),
    getSidebarCollapsed(),
  ]);

  return (
    <AppShell userEmail={actor?.id} userRole={actor?.role} sidebarCollapsed={sidebarCollapsed}>
      <PageHeader title="Reviews" description="Recommendations awaiting human review." />
      <div className="overflow-hidden rounded-none border border-border bg-surface">
        <TableEmpty
          title="Nothing awaiting review"
          description="Analyzed interactions will show up here for approval."
        />
      </div>
    </AppShell>
  );
}
