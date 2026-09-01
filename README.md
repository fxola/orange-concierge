# Orange Concierge - Sovereign Client Operations Copilot

Orange Concierge is a self-hosted AI copilot that helps Bitcoin consultants turn client notes and meeting transcripts into structured client profiles, risk signals, evidence-backed recommendations, follow-up questions, and review-ready action plans, while rejecting wallet seeds, private keys, passwords, recovery codes, and similar secrets before they can be stored or sent to an AI model.

## Stack

- Next.js 16.3.3
- TypeScript
- pnpm workspaces
- PostgreSQL + pgvector
- Docker Compose
- Nginx

## Run With Docker

```bash
cp .env.example .env
docker compose up -d
curl http://localhost/api/health
```

The app is available through Nginx at `http://localhost`.

## Run Locally

```bash
pnpm install
pnpm dev
```

The local development server runs at `http://localhost:3000`.

## Useful Commands

```bash
pnpm typecheck
pnpm test
pnpm build
```
