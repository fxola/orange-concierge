import { redirect } from 'next/navigation';

import { AuditTrailPage } from '@/features/audit/pages/audit-trail-page';
import { getAuditTrail } from '@/features/audit/presenters/get-audit-trail';

type AuditSearchParams = Readonly<{ action?: string; page?: string }>;

export default async function AuditRoute({
  searchParams,
}: Readonly<{ searchParams: Promise<AuditSearchParams> }>) {
  const params = await searchParams;
  const vm = await getAuditTrail({ action: params.action, page: params.page });

  if (vm.status === 'forbidden') {
    redirect('/clients');
  }

  return <AuditTrailPage vm={vm} />;
}
