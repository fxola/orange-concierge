import 'server-only';
import { cookies } from 'next/headers';
import { SIDEBAR_COOKIE } from '../components/app-shell/sidebar-cookie';

export { SIDEBAR_COOKIE };

/**
 * Whether the sidebar rail starts collapsed for this request.
 *
 * Read server-side from a cookie (set by the collapse toggle) so SSR and
 * the first client render agree. `localStorage` is invisible to the server
 * and caused an expanded→collapsed flash on every navigation, since each
 * page mounts a fresh `AppShell`.
 */
export async function getSidebarCollapsed(): Promise<boolean> {
  const store = await cookies();
  return store.get(SIDEBAR_COOKIE)?.value === '1';
}
