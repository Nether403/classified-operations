# Portfolio OS

## Overview

Portfolio OS is a cinematic full-stack portfolio web app with a "forbidden research terminal meets luxury product design" aesthetic. Features dark glass surfaces, amber + cold blue accents, editorial typography, and Framer Motion animations.

## Architecture

- **Monorepo**: pnpm workspaces, TypeScript 5.9
- **Frontend**: React + Vite (`artifacts/portfolio-os/`) at path `/`
- **Backend API**: Express 5 (`artifacts/api-server/`) at path `/api`
- **Database**: PostgreSQL + Drizzle ORM (`lib/db/`)
- **Auth**: Replit Auth (OIDC) with session-based cookies
- **AI Operator**: OpenAI (via Replit AI Integrations) - NEXUS-7 persona
- **API Spec**: OpenAPI at `lib/api-spec/openapi.yaml` → codegen via Orval

## Features

- **Dossier archive**: 6 seeded projects with classification badges, filter by tag/clearance/search
- **Project detail pages**: tech stack, domains, operation file sections, related projects
- **AI Operator (NEXUS-7)**: OpenAI-powered chat interface grounded in portfolio data
- **Vault**: auth-gated private notes per project
- **Cinematic UI**: glass morphism, amber/blue accents, monospace terminal aesthetic

## Key Commands

- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/db run seed` — seed database with 6 projects
- `pnpm --filter @workspace/api-server run build` — build API server
- `pnpm --filter @workspace/api-server run dev` — run API server

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `REPL_ID` — Used as OIDC client_id for Replit Auth
- `REPL_SLUG` / `REPLIT_DOMAINS` — Used for callback URLs
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (Replit AI Integrations)

## Directory Structure

```
artifacts/
  api-server/          # Express 5 API server
  portfolio-os/        # React + Vite frontend
lib/
  api-spec/            # OpenAPI spec + Orval config
  api-zod/             # Generated Zod schemas (from codegen)
  api-client-react/    # Generated React Query hooks (from codegen)
  db/                  # Drizzle ORM schema + seed script
  replit-auth-web/     # Browser auth state hook
  integrations-openai-ai-server/  # OpenAI server client
```

## Database Schema

- `users` — Replit Auth user records
- `sessions` — Session storage (OIDC)
- `projects` — Portfolio projects with classification, status, tech stack
- `project_sections` — Ordered content sections per project
- `tags` — Technology/domain tags
- `project_tags` — Project-tag join table
- `media_assets` — Media files per project
- `operator_conversations` — NEXUS-7 AI chat history
- `vault_notes` — Auth-gated private notes per project
