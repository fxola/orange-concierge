export type Client = Readonly<{
  id: string;
  displayName: string;
  createdAt: Date;
}>;

import * as z from 'zod';

export const MAX_LIST_LIMIT = 100;
export const clientIdSchema = z.string().trim().pipe(z.uuid());

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
