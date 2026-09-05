'use client';

import { useRouter } from 'next/navigation';
import { authClient } from '../auth-client';

export function SignOutButton() {
  const router = useRouter();

  const onClick = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          router.refresh();
        },
      },
    });
  };

  return (
    <button type="button" onClick={onClick}>
      Sign out
    </button>
  );
}
