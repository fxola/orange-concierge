export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(`API request failed: ${code} (status ${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function readErrorCode(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: unknown };
    return typeof data.error === 'string' ? data.error : 'unknown_error';
  } catch {
    return 'unknown_error';
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      ...init,
    });
  } catch {
    throw new ApiError(0, 'network_error');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorCode(response));
  }

  return (await response.json()) as T;
}

export const api = {
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },

  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },
};
