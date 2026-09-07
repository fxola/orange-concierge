import { AppShell } from '@/components/app-shell';
import { getCurrentActor } from '@/server/actor';
import { getSidebarCollapsed } from '@/server/sidebar';

export default async function OperationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [actor, sidebarCollapsed] = await Promise.all([getCurrentActor(), getSidebarCollapsed()]);

  return (
    <AppShell userEmail={actor?.id} userRole={actor?.role} sidebarCollapsed={sidebarCollapsed}>
      {children}
    </AppShell>
  );
}
