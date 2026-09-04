# TechPulse AI — Architecture

## System overview

```
┌────────────────────────────────────────────────────────────────┐
│  Next.js 15 app router (TypeScript, Tailwind v4, dark mode)   │
│                                                                │
│  src/app/(app)/pages      server components, force-dynamic     │
│  src/app/api/*            REST + SSE endpoints                 │
│  src/components/          UI primitives, cards, chat client    │
└───────────────┬───────────────────────────────┬────────────────┘
                │ prisma client                 │ fetch / SSE
┌───────────────▼────────────────┐   ┌──────────▼─────────────────┐
│ PostgreSQL 16 (docker-compose) │   │ Optional LLM providers     │
│  knowledge base / personalization/chat │  (OpenAI-compatible /  │
└───────────────▲────────────────┘   │   Anthropic) — streamed   │
                │                     └────────────────────────────┘
┌───────────────┴───────────────────────────────────────────────┐
│ Ingestion pipeline (scripts/ingest-cli.ts, admin triggers)    │
│  RSS/Atom adapter · GitHub releases adapter                    │
│  classify.ts  → kind / category / importance / tags           │
│  runner.ts    → SourceItem hash ledger (dedupe) + News writes │
└───────────────────────────────────────────────────────────────┘
```

- **Data layer:** PostgreSQL via Prisma. One process, no message broker in the
  MVP; ingestion runs as a CLI / admin-triggered job so it is trivially
  schedulable (cron, GitHub Actions) later. Redis ships in docker-compose and
  the cache layer (`src/lib/cache.ts`) is a one-line swap from the in-process
  store to Redis.
- **Rendering:** every content page is a server component with
  `dynamic = "force-dynamic"`, querying through the shared data layer
  (`src/lib/data.ts`). Interactivity (filters, palette, chat, save/follow) is
  isolated in small `"use client"` components.
- **Search:** PostgreSQL `contains`/full-text today; entity results are already
  normalized (kind + href + label) so Elasticsearch/OpenSearch can be swapped
  behind `/api/search` later.

## Knowledge-base model

Entities are related, not flat:

```
Company ── owns ──► Technology / AIModel / AITool / Release
News ──(NewsTechnology / NewsCompany)──► Technology / Company
Technology ──► Release ──► News (releaseId back-ref)
Technology ──► SecurityAdvisory ──► News coverage
Follow / SavedItem ──{entityType, entityId}──► any entity
```

This lets the assistant answer relationship-aware questions (e.g. “compare the
latest OpenAI and Anthropic models”, “what changed in React and does it affect
my app”) with database-backed facts instead of free association. See
[DATA_MODEL.md](./DATA_MODEL.md) for the full schema.

## Authentication

- JWT session cookie (`tp_session`, httpOnly, 30 days) via `jose`.
- Passwords hashed with bcrypt (`bcryptjs`).
- Guards: `requireUser()` / `requireAdmin()` in `src/lib/auth.ts`.
- Personal routes redirect to `/login?next=…`; demo users are seeded.

## AI chat design

Three layers keep the assistant grounded and provider-agnostic:

1. **Grounded engine** (`src/lib/chat/engine.ts`) — intent detection (dates,
   entities, compare, focus, non-tech guardrail), knowledge-base retrieval,
   and structured markdown composition with `[n]` citations. Works with zero
   external keys.
2. **LLM abstraction** (`src/lib/chat/llm.ts`) — returns a streaming text
   stream when an OpenAI-compatible or Anthropic key is configured; the route
   feeds it the same retrieved context so the LLM cannot hallucinate outside
   the tracked data.
3. **Chat API** (`/api/chat`) — SSE stream; persists `Chat` + `Message` rows
   (with `sources` JSON) for authenticated users, stores `lastSubject` meta
   for follow-up context (“which one affects me?”).

## Ingestion pipeline

Each run creates an `IngestionJob` (status, counts, log) and processes one
source at a time:

1. **Fetch** — RSS/Atom (dependency-free XML parser) or GitHub releases API
   (`GITHUB_TOKEN` optional).
2. **Dedupe** — `SourceItem.urlHash` unique ledger → the same URL is never
   ingested twice across runs or sources.
3. **Classify** — keyword scoring for news category, importance
   (CRITICAL/HIGH/MEDIUM/LOW), kind (advisory/model/tool/release/paper…),
   tags, plus technology-name matching against the catalog.
4. **Cluster** — titles are normalized to a `clusterKey`; the first item in a
   cluster is marked `isPrimary` (the official source wins by ordering
   reliability) and later items become coverage links (§27 dedupe).
5. **Summarize** — TL;DR, whatChanged / whyItMatters / whoAffected / whatToDo
   analysis fields are written for the UI (§28).

## Reliability ranking

`SOURCE_RANK` (constants.ts) orders official docs > official blogs > GitHub /
changelogs > research > publications > community. Source rows carry a
1–10 `reliability` score surfaced in the UI and used by clustering.

## Personalization & notifications

- `Follow` (watchlist) and `SavedItem` share one generic
  `{entityType, entityId}` vocabulary (constants `ENTITY_TYPE`).
- Dashboard “For you” reads followed technologies and surfaces their latest
  primary story.
- `src/lib/notifications.ts` materializes notifications for a user’s follows
  (releases, advisories, company news, models, tools); fingerprints make it
  idempotent. The digest API triggers it on read, and a scheduler can call it
  the same way.

## Configuration

| Env | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://techpulse:techpulse@localhost:54329/techpulse` | Prisma/Postgres |
| `REDIS_URL` | `redis://localhost:16379` | future cache backend |
| `AUTH_SECRET` | — | JWT signing (min 16 chars) |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | — | optional chat LLM |
| `GITHUB_TOKEN` | — | optional GitHub API auth |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | links |

## Future-proofing

- **Provider abstraction** means new LLM vendors are a new adapter in `llm.ts`.
- **Generic entity references** let new entity types (papers, patents,
  startups) join the knowledge base without new join tables for follows/saves.
- **Adapter interface** in `ingest/` makes new sources a ~50-line file.
- **Cache facade** + search normalization ease scaling to Redis/Elasticsearch.
- All content pages render from the database — there is no hardcoded frontend
  content that would need extraction later.
