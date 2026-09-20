export type Client = Readonly<{
  id: string;
  displayName: string;
  createdAt: Date;
}>;

import * as z from 'zod';

export const MAX_LIST_LIMIT = 100;
export const clientIdSchema = z.string().trim().pipe(z.uuid());
export const clientIdsSchema = z
  .array(clientIdSchema)
  .max(MAX_LIST_LIMIT, `A maximum of ${MAX_LIST_LIMIT} clients can be requested at once.`);

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(MAX_LIST_LIMIT),
  offset: z.number().int().min(0),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const parseClientId = (raw: unknown): { ok: true; clientId: string } | { ok: false } => {
  const result = clientIdSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false };
  }
  return { ok: true, clientId: result.data };
};

export const parsePagination = (
  raw: unknown
): { ok: true; limit: number; offset: number } | { ok: false } => {
  const result = paginationSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false };
  }
  return { ok: true, limit: result.data.limit, offset: result.data.offset };
};

export type ParseClientIdsResult =
  | { ok: true; clientIds: string[] }
  | { ok: false; reason: 'too_many_client_ids'; maximum: number }
  | { ok: false; reason: 'invalid_client_id'; index?: number };

export const parseClientIds = (raw: unknown): ParseClientIdsResult => {
  const result = clientIdsSchema.safeParse(raw);

  if (result.success) {
    return { ok: true, clientIds: result.data };
  }

  const tooManyIssue = result.error.issues.find(
    (issue) => issue.code === 'too_big' && issue.origin === 'array'
  );

  if (tooManyIssue) {
    return { ok: false, reason: 'too_many_client_ids', maximum: MAX_LIST_LIMIT };
  }

  const invalidClientIdIssue = result.error.issues.find(
    (issue) => typeof issue.path[0] === 'number'
  );

  return {
    ok: false,
    reason: 'invalid_client_id',
    index:
      typeof invalidClientIdIssue?.path[0] === 'number' ? invalidClientIdIssue.path[0] : undefined,
  };
};
