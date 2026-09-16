export type ProviderHttpResponse = Pick<Response, 'ok' | 'json'>;

export type ProviderFetch = (url: string, init: RequestInit) => Promise<ProviderHttpResponse>;

export const DEFAULT_PROVIDER_TIMEOUT_MS = 300_000;

export type ProviderJsonFailureKind = 'request_failed' | 'invalid_response';

export type ProviderJsonErrorInput = Readonly<{
  kind: ProviderJsonFailureKind;
  message: string;
  cause?: unknown;
}>;

export type ProviderJsonErrorFactory = (input: ProviderJsonErrorInput) => Error;

export type PostProviderJsonInput = Readonly<{
  fetchFn: ProviderFetch;
  url: string;
  headers?: Record<string, string>;
  body: unknown;
  timeoutMs: number;
  providerName: string;
  createError?: ProviderJsonErrorFactory;
}>;

const providerJsonErrors = new WeakSet<Error>();

export function normalizeProviderModel(model: string, label: string): string {
  const trimmed = model.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

export function normalizeProviderBaseUrl(name: string, value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not valid: "${value}".`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${name} must use http or https: "${value}".`);
  }

  return url.toString().replace(/\/+$/, '');
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readRequiredString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const strings: string[] = [];
  for (const item of value) {
    const stringItem = readRequiredString(item);
    if (!stringItem) {
      return null;
    }
    strings.push(stringItem);
  }

  return strings;
}
export async function postProviderJson(input: PostProviderJsonInput): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await input.fetchFn(input.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...input.headers,
      },
      body: JSON.stringify(input.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw createProviderJsonError(input, {
        kind: 'request_failed',
        message: `${input.providerName} request failed.`,
      });
    }

    try {
      return await response.json();
    } catch (error) {
      throw createProviderJsonError(input, {
        kind: 'invalid_response',
        message: `${input.providerName} returned invalid JSON.`,
        cause: error,
      });
    }
  } catch (error) {
    if (isProviderJsonError(error)) {
      throw error;
    }

    throw createProviderJsonError(input, {
      kind: 'request_failed',
      message: `${input.providerName} request failed.`,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function createProviderJsonError(
  input: PostProviderJsonInput,
  errorInput: ProviderJsonErrorInput
): Error {
  const error =
    input.createError?.(errorInput) ?? new Error(errorInput.message, { cause: errorInput.cause });
  providerJsonErrors.add(error);
  return error;
}

function isProviderJsonError(error: unknown): error is Error {
  return error instanceof Error && providerJsonErrors.has(error);
}
