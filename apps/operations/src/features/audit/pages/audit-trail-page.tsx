import { PageHeader, Table, TableBody, TableEmpty, TableHead } from '@/components/ui/page';
import type { AuditTrailViewModel } from '@/features/audit/view-models/audit-trail';
import { AuditEventCard } from '../components/audit-event-card';
import { AuditFilterTabs } from '../components/audit-filter-tabs';
import { AuditPaginationFooter } from '../components/audit-pagination-footer';
import { AuditTableRow } from '../components/audit-table-row';
import { AuditTrailUnavailable } from '../components/audit-trail-unavailable';

export function AuditTrailPage({
  vm,
}: {
  vm: Extract<AuditTrailViewModel, { status: 'ok' } | { status: 'unavailable' }>;
}) {
  if (vm.status === 'unavailable') {
    return <AuditTrailUnavailable />;
  }

  return (
    <>
      <PageHeader title="Audit trail" />
      <div className="mb-4">
        <AuditFilterTabs active={vm.action} />
      </div>
      {vm.rows.length === 0 ? (
        <div className="overflow-hidden rounded-none border border-border bg-surface">
          <TableEmpty title="No audit events to show yet" description={vm.emptyCopy} />
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {vm.rows.map((row) => (
              <AuditEventCard key={row.key} row={row} />
            ))}
          </div>
          <div className="hidden md:block">
            <Table className="table-fixed">
              <TableHead>
                <th>Time</th>
                <th>Event</th>
                <th>Actor</th>
                <th>Resource</th>
                <th>Details</th>
              </TableHead>
              <TableBody>
                {vm.rows.map((row) => (
                  <AuditTableRow key={row.key} row={row} />
                ))}
              </TableBody>
            </Table>
          </div>
          <AuditPaginationFooter
            page={vm.page}
            totalPages={vm.totalPages}
            total={vm.total}
            action={vm.action}
          />
        </>
      )}
    </>
  );
}
