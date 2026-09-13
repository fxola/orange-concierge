# Orange Concierge - Sovereign Client Operations Copilot

Orange Concierge is a self-hosted AI copilot that helps Bitcoin consultants turn client notes and meeting transcripts into structured client profiles, risk signals, evidence-backed recommendations, follow-up questions, and review-ready action plans, while rejecting wallet seeds, private keys, API keys, recovery codes, and similar secrets before they can be sent to an AI model.

## Stack

- Next.js 16.3.3
- TypeScript
- pnpm workspaces
- PostgreSQL + pgvector
- Docker Compose
- Nginx

## Run Locally With Ollama

- Copy the sample env to your .env file

```bash
cp .env.development.example .env
```

- And run the following commands.

```bash
pnpm install
docker compose up -d db ollama ollama-pull
pnpm db:migrate
pnpm db:seed
pnpm knowledge:index
pnpm dev
```

- Then Open: http://localhost:3000.

`ollama-pull` fetches the configured chat model plus `nomic-embed-text` for `pnpm knowledge:index`.

## Run Locally With Gemini Cloud

- Copy the sample env to you .env file and run pnpm install

```bash
cp .env.development.example .env
pnpm install
```

- Edit your .env file:

```bash
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
AI_API_KEY=your-gemini-api-key
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

- Then run only Postgres:

```bash
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm knowledge:index
pnpm dev
```

- And Open: http://localhost:3000

Gemini extraction uses `AI_MODEL`; knowledge indexing uses `text-embedding-004`.

## Useful Commands

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm knowledge:index
```
