import { headers } from 'next/headers';
import { getCurrentActor } from '../src/server/session';
import { SignOutButton } from '../src/components/sign-out-button';

export default async function Home() {
  const actor = await getCurrentActor(await headers());

  return (
    <main>
      <h1>Orange Concierge — Operations Copilot</h1>
      <p>
        Health: <a href="/api/health">/api/health</a>
      </p>
      {actor ? (
        <div>
          <p>
            Signed in as <code>{actor.id}</code> (role: <code>{actor.role}</code>)
          </p>
          <SignOutButton />
        </div>
      ) : (
        <p>
          <a href="/login">Sign in</a> with a seeded demo account.
        </p>
      )}
    </main>
  );
}
