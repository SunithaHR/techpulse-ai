# Deploying TechPulse AI

Production target: **Vercel** (Next.js) + a **hosted Postgres** (Prisma).

Good news on the runtime side:

- The cache is an in-process memory store — **no Redis is required in production**
  even though `docker-compose.yml` runs one locally.
- Local docker-compose Postgres/Redis are dev-only conveniences; Vercel never
  sees them.

Secrets (`.env`, `.env.local`) are gitignored and never committed. Everything a
fresh environment needs is documented in `.env.example`.

---

## 1. Push to GitHub

```bash
# from the project root (TechPulseAI/)
git init
git add -A
git commit -m "Initial commit: TechPulse AI platform"
```

Then create an empty repository at <https://github.com/new> (e.g.
`techpulse-ai`, private is fine to start) and push:

```bash
git branch -M main
git remote add origin https://github.com/<your-user>/techpulse-ai.git
git push -u origin main
```

Git will prompt for credentials — use a Personal Access Token
(<https://github.com/settings/tokens>, classic, `repo` scope) as the password.
Revoke the token afterwards; GitHub Desktop or `gh auth login` also work.

---

## 2. Provision a hosted Postgres

Vercel cannot run your docker-compose Postgres. Any of these work; pick one:

| Provider | Notes |
| --- | --- |
| **Vercel Postgres** | Create it from the project's Storage tab after import (Step 4). Integration auto-fills `POSTGRES_URL` — you then set `DATABASE_URL` to it. |
| **Neon** | Free tier. Create a project → copy the **pooled** connection string (host ending in `-pooler`). |
| **Supabase** | Free tier. Project → Settings → Database → connection string. Use the **transaction-mode pooler (port 6543)** for the app and the **session-mode pooler (port 5432)** for migrations — see the pooler section below. |
| **Railway / Render** | Any standard Postgres 14+ works. |

Write the connection string down — it becomes the `DATABASE_URL` env var.

### Supabase / Neon poolers: which URL goes where

Connection poolers exist because serverless (Vercel) spawns many short-lived
processes, each wanting its own DB connection. Two rules of thumb:

- **App runtime → transaction-mode pooler.** For Supabase that is port **6543**
  (`aws-0-<region>.pooler.supabase.com:6543`); for Neon it's the `-pooler`
  host. Append `?pgbouncer=true&connection_limit=5` to the URL so Prisma uses
  the pooler correctly with a bounded pool. This URL is your `DATABASE_URL`.
- **Migrations → session/direct connection.** Supabase port **5432** (session
  pooler) or Neon's direct host. Migrations over a transaction-mode pooler
  fail, so keep a second URL handy and prefix the migrate command with it
  (see step 3).

> Why not point the app at the session pooler? Supabase caps it at **15**
> concurrent clients and Prisma's default pool (`cpu×2+1`, often >15) plus
> parallel queries like `/api/search`'s 8-way `Promise.all` blow straight past
> it, producing `EMAXCONNSESSION` 500s. The transaction pooler's limit is far
> higher and `connection_limit=5` keeps Vercel's usage bounded.

---

## 3. Apply the schema and load demo data

From a machine with network access to the hosted DB (your laptop is fine):

```bash
# Use the SESSION / direct URL (not the transaction pooler) for both commands.
# PowerShell:  $env:DATABASE_URL = "postgresql://..."
DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/<db>" npx prisma migrate deploy
DATABASE_URL="postgresql://<user>:<pass>@<host>:5432/<db>" npm run db:seed
```

- `db:seed` **wipes and reseeds** by design — safe the first time on an empty DB.
- Rerunning `db:seed` on the live DB resets it; use `npm run db:seed -- --keep`
  to add a fresh day of demo content without wiping.
- The seed anchors content to *today*, so the dashboard is populated on day one.

Seeded accounts (change or delete these before real use):

- Admin: `admin@techpulse.dev` / `admin1234`
- Demo:  `demo@techpulse.dev` / `demo1234`

---

## 4. Deploy on Vercel

1. Go to <https://vercel.com/new> and **Import** the GitHub repository from
   step 1. Vercel auto-detects Next.js — no build overrides needed.
2. In **Settings → Environment Variables**, add:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Your hosted Postgres **transaction-pooler** connection string from step 2 (with `?pgbouncer=true&connection_limit=5` appended for Supabase) |
| `AUTH_SECRET` | `openssl rand -base64 32` (any long random string) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` |
| `OPENAI_API_KEY` | *Optional* — chat uses the built-in grounded engine without it |
| `ANTHROPIC_API_KEY` | *Optional* — same |
| `GITHUB_TOKEN` | *Optional* — for the live GitHub ingestion adapter |

3. **Deploy**. The build runs `next build`; Prisma's client auto-generates
   during install from `prisma/schema.prisma`.

> The chat endpoint streams without any LLM key (grounded, retrieval-based
> answers). Add `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` to switch to model answers
> grounded on the same retrieved context.

---

## 5. Keep the data fresh

The demo seed is static. To track real technology updates, run ingestion
against the production database:

```bash
# PowerShell:  $env:DATABASE_URL = "..."; $env:GITHUB_TOKEN = "..."
DATABASE_URL="postgresql://..." GITHUB_TOKEN="..." npm run ingest
```

or trigger it from **Admin → Overview → Run ingestion** in the UI. Sources,
jobs, and duplicate clusters are managed in `/admin`.

A scheduled option (Vercel Cron) can be added later: hit
`/api/admin/ingest` on a timer, protected by `AUTH_SECRET`-signed auth.

---

## Troubleshooting

- **Build fails on DB queries** — none of the pages query the DB at build time;
  if you see Prisma errors during build, double-check `DATABASE_URL` is set on
  the Vercel project (builds run with project env vars).
- **`P1001: can't reach database` at runtime** — confirm the DB allows
  connections from Vercel (Neon/Supabase allow by default; Vercel Postgres is
  auto-allowed) and the URL has no typo. On Supabase, also prefer the pooler
  host: direct hosts can be IPv6-only, which Vercel (IPv4-only) cannot reach.
- **`prepared statement "s1" already exists`** — this appears when running
  `prisma db execute`/migrations through a transaction-mode pooler. Use the
  session/direct URL for migrations; the app itself (`pgbouncer=true`) is
  unaffected.
- **`EMAXCONNSESSION` / pool exhaustion at runtime** — you're pointing the app
  at a session-mode pooler (Supabase caps at 15 clients). Switch `DATABASE_URL`
  to the **transaction-mode pooler (port 6543)** with
  `?pgbouncer=true&connection_limit=5`. If the session pool is already full,
  terminate stuck sessions from the transaction pooler:
  `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid() AND usename LIKE 'postgres.%' AND state = 'idle';`
- **Redirect loop on login** — make sure `NEXT_PUBLIC_APP_URL` is the deployed
  `https://` origin, not `http://localhost:3000`.
