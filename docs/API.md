# TechPulse AI — API reference

All endpoints are JSON (`/api/*`), served by the Next.js app. Content routes
are unauthenticated; personal routes require the `tp_session` cookie set by
`POST /api/auth/login` or `/api/auth/register`. Admin routes additionally
require the `ADMIN` role. `{id}`s are Prisma cuids, `{slug}`s are URL slugs,
`{fullName}` is `owner/repo`.

## Health

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | `{ ok, service, time }` |

## Content

| Method | Path | Query | Description |
| --- | --- | --- | --- |
| GET | `/api/news` | `category, importance, kind, tech, company, q, from, to, limit, skip` | Primary news stories |
| GET | `/api/timeline` | `days` (1–90), `category, importance, tech, company` | News grouped by day `{ days: [{ day, label, date, items }] }` |
| GET | `/api/releases` | `tech, company, importance, from, to, limit, skip` | Versioned releases |
| GET | `/api/techs` | — | Technologies with counts |
| GET | `/api/techs/:slug` | — | Technology + releases + news + advisories + repo |
| GET | `/api/companies` | — | Companies with counts |
| GET | `/api/companies/:slug` | — | Company + models + tools + news + releases |
| GET | `/api/models` | `q, company, limit` | AI models |
| GET | `/api/tools` | `q, cat, limit` | AI tools (cat = TOOL category key) |
| GET | `/api/security` | `tech, severity, limit` | Security advisories |
| GET | `/api/repos` | `q, lang, limit` | GitHub repositories |

## Search

| Method | Path | Query | Description |
| --- | --- | --- | --- |
| GET | `/api/search` | `q, limit` | Grouped results: `NEWS, RELEASES, TECHNOLOGIES, COMPANIES, MODELS, TOOLS, REPOSITORIES, ADVISORIES` |

Each hit is normalized as `{ id, title|name, sub, href, … }` so clients can
render one list (the ⌘K palette and /search page both consume this).

## Auth

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ email, password, name?, next? }` | Creates user + session cookie |
| POST | `/api/auth/login` | `{ email, password, next? }` | Verifies + sets session cookie |
| GET | `/api/auth/logout` | — | Clears cookie, redirects to `/` |

## Personalization (auth required)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/user-state?kind=save\|follow&type=&id=` | Is this entity saved/followed? |
| POST | `/api/save` | `{ entityType, entityId }` toggle bookmark |
| POST | `/api/follow` | `{ entityType, entityId, label? }` toggle watchlist |
| GET | `/api/chats` | List the user's conversations |
| GET | `/api/chats/:id` | Messages with sources |
| DELETE | `/api/chats/:id` | Delete a conversation |
| GET | `/api/notifications` | `{ items, unread }` |
| POST | `/api/notifications/read` | `{}` or `{ id }` — mark all / one read |
| PUT | `/api/settings` | `{ name?, headline?, bio?, prefs? }` |
| GET | `/api/digest?format=json\|text&scope=DAILY\|WEEKLY` | Digest + materializes notifications |

## Chat

**POST `/api/chat`** — body `{ message, chatId? }`, response is an
**SSE stream** of events:

```jsonc
data: { "delta": "## Next.js — latest changes…" }   // streamed chunks
data: { "done": true, "chatId": "…", "messageId": "…",
        "sources": [{ "title", "href", "label", "kind" }],
        "followUps": ["…", "…"] }
```

- Grounded in the knowledge base; works without any LLM key (local engine).
- With `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` set, chunks are streamed by the
  LLM using the same retrieved context.
- Authenticated requests persist `Chat`/`Message` rows (with sources);
  anonymous requests stream without persistence.

## Admin (ADMIN role)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/admin` | Overview stats + recent jobs + sources |
| GET/POST | `/api/admin/sources` | List sources / create one `{ name, type, url, feedUrl?, homepage?, reliability? }` |
| GET | `/api/admin/jobs` | Recent ingestion jobs |
| POST | `/api/admin/ingest` | `{ sourceId?, kind? }` — run ingestion now |
| POST | `/api/admin/seed` | Wipe + re-seed demo dataset (re-anchors dates to today) |

## Status codes & errors

- `401` — missing/invalid session (personal routes)
- `400` — malformed body / missing params
- `404` — unknown entity slug or id
- `500` — provider/ingestion failure (admin endpoints return `{ error }`)

Errors are always `{ "error": "human readable message" }`.
