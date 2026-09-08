import { AppShell } from '@/components/app-shell';
import { getCurrentActor, isNextControlFlowError } from '@/server/actor';
import { getSidebarCollapsed } from '@/server/sidebar';

async function loadShell(): Promise<readonly [{ id: string; role: string } | null, boolean]> {
  try {
    return await Promise.all([getCurrentActor(), getSidebarCollapsed()]);
  } catch (error) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return [null, false] as const;
  }
}

export default async function OperationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [actor, sidebarCollapsed] = await loadShell();

  return (
    <AppShell userEmail={actor?.id} userRole={actor?.role} sidebarCollapsed={sidebarCollapsed}>
      {children}
    </AppShell>
  );
}
