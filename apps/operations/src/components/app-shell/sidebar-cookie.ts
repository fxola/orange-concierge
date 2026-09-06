/**
 * Single source of truth for the sidebar collapse preference, shared by
 * the server reader (`src/server/sidebar.ts`) and the client toggle writer
 * below. Plain module — no `server-only` import — so both sides can use it.
 */
export const SIDEBAR_COOKIE = 'oc-sidebar';

export function writeCollapsedCookie(collapsed: boolean): void {
  try {
    document.cookie = `${SIDEBAR_COOKIE}=${collapsed ? '1' : '0'}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Storage unavailable — preference simply won't persist.
  }
}
