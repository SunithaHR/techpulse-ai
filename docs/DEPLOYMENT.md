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
| **Neon** | Free tier. Create a project → copy the pooled connection string (host ending in `-pooler`). |
| **Supabase** | Free tier. Project → Settings → Database → connection string. Use the direct (non-pooler / port 5432) URI if available. |
| **Railway / Render** | Any standard Postgres 14+ works. |

Write the connection string down — it becomes the `DATABASE_URL` env var.

---

## 3. Apply the schema and load demo data

From a machine with network access to the hosted DB (your laptop is fine):

```bash
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
| `DATABASE_URL` | Your hosted Postgres connection string from step 2 |
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
  auto-allowed) and the URL has no typo.
- **Connection pool exhaustion** — if you use a pooled Neon URL and see pool
  errors, switch `DATABASE_URL` to Neon's **direct** connection string instead.
- **Redirect loop on login** — make sure `NEXT_PUBLIC_APP_URL` is the deployed
  `https://` origin, not `http://localhost:3000`.
