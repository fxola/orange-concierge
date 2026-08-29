# Orange Concierge — Sovereign Client Operations Copilot

> Orange Concierge is a self-hosted AI copilot that turns client notes/transcripts into structured profiles, risks, and consultant action plans — **without ever storing or sending secrets**.

**Stack (TS-only, pnpm):** Next.js 16.3.3 + TypeScript · Mastra (agents + workflows) · Zod · PostgreSQL + pgvector · Docker Compose + Nginx · DeepSeek / Gemini free + Ollama (sovereign) · pino

## Monorepo (pnpm workspaces)

```
apps/operations/          # Next.js App Router (internal tool)
packages/
  ai/                     # Mastra, provider abstraction (deepseek|gemini|ollama|mock), schemas, workflows, agents, RAG, evals
  security/               # secret scanner (BIP39 12/24, xprv, WIF)
  database/               # Drizzle + pgvector schema/migrations
  observability/          # pino + audit helpers
docker-compose.yml        # db, web, nginx, ollama (--profile sovereign)
nginx.conf
```

## Quick start (local Docker)

```bash
cp .env.example .env        # set AUTH_SECRET; optional DEEPSEEK_API_KEY / GOOGLE_API_KEY
docker compose up -d
curl http://localhost/api/health
# dev without Docker:
pnpm install
pnpm dev                    # → http://localhost:3000
```

Sovereign mode (M9):

```bash
docker compose --profile sovereign up -d ollama
curl http://localhost:11434/api/pull -d '{"name":"llama3.1:8b"}'
```
MIT
