import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@orange-concierge/infrastructure', () => ({
  getApplication: vi.fn(),
}));

import { UnauthorizedError } from '@orange-concierge/core';
import { getApplication } from '@orange-concierge/infrastructure';
import { getCurrentActor, requireActor } from './session';

const getSessionMock = vi.fn();
const getApplicationMock = vi.mocked(getApplication);

beforeEach(() => {
  vi.clearAllMocks();
  getApplicationMock.mockReturnValue({
    auth: { api: { getSession: getSessionMock } },
  } as unknown as ReturnType<typeof getApplication>);
});

describe('session → Actor boundary', () => {
  it('maps a valid session user to a core Actor', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user-1', role: 'consultant' } });

    await expect(getCurrentActor(new Headers())).resolves.toEqual({
      id: 'user-1',
      role: 'consultant',
    });
  });

  it('returns null when there is no session user', async () => {
    getSessionMock.mockResolvedValue(null);

    await expect(getCurrentActor(new Headers())).resolves.toBeNull();
  });

  it('returns null for an unknown role instead of leaking it into core', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user-1', role: 'superadmin' } });

    await expect(getCurrentActor(new Headers())).resolves.toBeNull();
  });

  it('requireActor throws UnauthorizedError when no actor resolves', async () => {
    getSessionMock.mockResolvedValue(null);

    await expect(requireActor(new Headers())).rejects.toThrow(UnauthorizedError);
  });

  it('requireActor returns the actor when the session is valid', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user-1', role: 'admin' } });

    await expect(requireActor(new Headers())).resolves.toEqual({ id: 'user-1', role: 'admin' });
  });
});
