FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/operations/package.json ./apps/operations/package.json
COPY packages/ai/package.json ./packages/ai/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/infrastructure/package.json ./packages/infrastructure/package.json
COPY packages/observability/package.json ./packages/observability/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/operations/node_modules ./apps/operations/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_SECRET=build-time-only-secret-1234567890abcdef
ENV BETTER_AUTH_SECRET=build-time-only-secret-abcdef1234567890
WORKDIR /app/apps/operations
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/operations ./apps/operations
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3000
WORKDIR /app/apps/operations
CMD ["pnpm", "start"]
