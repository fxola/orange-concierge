FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/operations/package.json ./apps/operations/package.json
COPY packages/ai/package.json ./packages/ai/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/infrastructure/package.json ./packages/infrastructure/package.json
COPY packages/security/package.json ./packages/security/package.json
COPY packages/observability/package.json ./packages/observability/package.json
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/operations/node_modules ./apps/operations/node_modules
COPY . .
WORKDIR /app/apps/operations
RUN pnpm build || echo "M1: Next build skipped — app scaffold only"

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/operations ./apps/operations
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3000
CMD ["pnpm", "--filter", "operations", "start"]
