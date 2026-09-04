# TechPulse AI

**Your AI-powered technology intelligence platform.**

> Track AI, software releases, developer tools, security, cloud, and everything
> changing in technology — organized by date and powered by an assistant that
> understands only technology.

TechPulse AI is a knowledge-base platform (not another news website) that
combines: **technology news + release tracking + AI model/tool directories +
security advisories + GitHub tracking + comparisons + a grounded AI assistant**.

- [Architecture](./docs/ARCHITECTURE.md)
- [REST API reference](./docs/API.md)
- [Data model](./docs/DATA_MODEL.md)
- [Deploying to GitHub + Vercel](./docs/DEPLOYMENT.md)

---

## Features

| Area | What you get |
| --- | --- |
| **Dashboard** | Today's technology pulse with importance filters, category chips, latest releases and security in a right rail |
| **Timeline** | Everything dated — today, yesterday, 7/30 days, this month, custom ranges, grouped per day |
| **Releases** | Version-by-version changelogs (highlights, breaking, security, performance, migration) for React, Node, Postgres, Kubernetes, Docker, cloud and 60+ tracked technologies |
| **AI hub** | Model specs (context, pricing, capabilities, benchmarks, open-weight status) and an AI tool directory across 18 categories |
| **Security** | Advisories with CVE, CVSS, affected/fixed versions and recommended actions |
| **GitHub** | Repositories with stars, language, license and latest release; linked back to tracked technologies |
| **Compare** | Side-by-side specs for models, technologies, AI tools and companies |
| **AI Chat** | Technology-only assistant grounded in the tracked knowledge base — releases, comparisons, date questions, security; answers cite sources, stream, support follow-ups and history |
| **Watchlist / Saved** | Follow technologies/companies/models/tools; bookmark anything; personal "For you" strip |
| **Digest** | Daily and weekly briefings: top stories, releases, security, AI |
| **Search** | Global search across news, releases, techs, companies, models, tools, repos, advisories (+ ⌘K palette) |
| **Notifications** | Materialized for followed entities on digest fetch |
| **Admin** | Source management, ingestion job history, duplicate clusters, run ingestion / re-seed |

## Quick start

Requirements: **Node.js 20+**, **Docker** (for Postgres + Redis), npm.

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres + Redis
npm run db:up

# 3. Configure environment
cp .env.example .env.local
#   edit DATABASE_URL / REDIS_URL / AUTH_SECRET as needed (defaults in .env.example work out of the box)

# 4. Create schema + seed a realistic demo dataset
npm run db:deploy
npm run db:seed

# 5. Run the app
npm run dev            # http://localhost:3000
```

**Demo accounts** (created by the seed):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@techpulse.dev` | `admin1234` |
| User | `demo@techpulse.dev` | `demo1234` |

The seed generates internally-consistent **sample data** (illustrative news,
releases and advisories for local development) anchored to the current date.
It is **not** live journalism — production content flows through the ingestion
workers below. Re-anchor "today" anytime with `npm run db:seed` or the
**Admin → Re-seed database** button.

## Ingestion (real sources)

The pipeline pulls RSS/Atom feeds and GitHub releases, deduplicates by URL
hash + content hash, classifies kind/category/importance, links technologies
and writes `News` rows with cluster keys for same-event stories.

```bash
npm run ingest                          # all active sources
npm run ingest -- --kind GITHUB         # GitHub-only sources
npm run ingest -- --source <source-id>  # a single source
```

Configure sources in the **Admin → Sources** tab (type, feed URL, reliability
score). Reliability ranking (§29) prioritizes official docs/blogs over
community sources.

## AI assistant

`/chat` is grounded and **works with zero API keys**: the local engine
(`src/lib/chat/engine.ts`) answers from the knowledge base with citations.
When you add a key it upgrades to a streamed LLM response using the same
retrieved context:

```bash
# OpenAI-compatible (or Azure/OpenRouter/etc. via OPENAI_BASE_URL)
OPENAI_API_KEY=sk-... OPENAI_MODEL=gpt-4o-mini

# or Anthropic
ANTHROPIC_API_KEY=sk-ant-... ANTHROPIC_MODEL=claude-sonnet-4-5
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev / production build / start |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:up` | docker compose up (Postgres + Redis) |
| `npm run db:migrate` / `db:deploy` | prisma migrate dev / deploy |
| `npm run db:seed` | wipe + seed demo dataset |
| `npm run db:reset` | destructive reset of the local database |
| `npm run ingest` | run the ingestion pipeline |
| `npm run lint` | eslint |

## Project layout

```
prisma/schema.prisma      # PostgreSQL knowledge-base model
scripts/                  # seed CLI, ingest CLI, db utilities
src/app/(app)/            # authenticated app pages (dashboard, news, releases, …)
src/app/admin/            # admin area
src/app/api/              # REST + streaming endpoints
src/components/           # UI primitives, cards, chat UI, shell
src/lib/constants.ts      # canonical categories/kinds/importance sets
src/lib/data.ts           # shared query layer for pages & APIs
src/lib/chat/             # grounded engine + LLM provider abstraction
src/lib/ingest/           # adapters (RSS, GitHub), classify, dedupe, runner
src/lib/seed/             # curated demo dataset generator
```

## Roadmap hooks

The schema and service layer already anticipate: browser extension, email /
Slack / Discord digests, personalized AI briefings, trend prediction,
knowledge-graph navigation, research-paper tracking and company intelligence.
The AI layer is provider-agnostic by design.
