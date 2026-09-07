import Link from 'next/link';

import { PageHeader, Table, TableBody, TableEmpty, TableHead } from '@/components/ui/page';
import type { ClientListViewModel } from '@/features/clients/view-models/clients';

export function ClientsPage({ vm }: { vm: ClientListViewModel }) {
  return (
    <>
      <PageHeader title="Clients" description="Consultancy client records." />
      {vm.status === 'empty' ? (
        <div className="overflow-hidden rounded-none border border-border bg-surface">
          <TableEmpty
            title="No clients to show yet"
            description="Client records will appear here."
          />
        </div>
      ) : (
        <Table>
          <TableHead>
            <th>Name</th>
            <th>Since</th>
          </TableHead>
          <TableBody>
            {vm.rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/clients/${row.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.displayName}
                  </Link>
                </td>
                <td>{row.createdAtLabel}</td>
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
