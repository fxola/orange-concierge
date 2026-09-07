import 'server-only';

import { cache } from 'react';
import { getApplication } from '@orange-concierge/infrastructure';

/**
 * Per-request session lookup, deduplicated by session cookie.
 *
 * Keyed on the cookie string (a primitive) rather than the `Headers`
 * object: `React.cache()` compares arguments with `Object.is`, and each
 * `await headers()` call site produces a distinct instance that would
 * never hit the cache. Session resolution only needs the cookie, so a
 * cookie-only `Headers` is forwarded to Better Auth.
 *
 * This module owns session mechanics only. Session → Actor mapping lives
 * in `./actor`.
 */
const getSessionByCookie = cache(async (cookie: string) => {
  const application = getApplication();
  return application.auth.api.getSession({
    headers: new Headers(cookie ? { cookie } : {}),
  });
});

export async function getSession(headers: Headers) {
  return getSessionByCookie(headers.get('cookie') ?? '');
}
