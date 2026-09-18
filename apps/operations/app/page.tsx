import { redirect } from 'next/navigation';

import { getCurrentActor, isNextControlFlowError } from '@/server/actor';
import { getSidebarCollapsed } from '@/server/sidebar';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

export default async function Home() {
  const [actor, sidebarCollapsed] = await Promise.all([
    getCurrentActor(),
    getSidebarCollapsed(),
  ]).catch((error: unknown) => {
    if (isNextControlFlowError(error)) {
      throw error;
    }
    // Show the signed out home page instead of throwing into a boundary.
    return [null, false] as const;
  });

  if (actor) {
    redirect('/clients');
  }

  return (
    <AppShell userEmail={actor?.id} userRole={actor?.role} sidebarCollapsed={sidebarCollapsed}>
      <Card className="w-full max-w-md">
        <Text variant="h1">Orange Concierge</Text>
        <Text tone="muted" className="mt-1">
          Operations Copilot
        </Text>
        <Text variant="small" tone="muted" className="mt-4">
          Health: <a href="/api/health">/api/health</a>
        </Text>
        {actor ? (
          <Text variant="small" className="mt-4">
            Signed in as <code>{actor.id}</code> (role: <code>{actor.role}</code>)
          </Text>
        ) : (
          <Text variant="small" tone="muted" className="mt-4">
            Sign in from the header to continue.
          </Text>
        )}
      </Card>
    </AppShell>
  );
}
