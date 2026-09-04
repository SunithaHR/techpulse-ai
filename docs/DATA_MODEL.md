# TechPulse AI — Data model

PostgreSQL via Prisma (`prisma/schema.prisma`). Conventions:

- Enum-like fields (`importance`, `kind`, `severity`, `status`, `role`) are
  plain strings over the constant sets in `src/lib/constants.ts`.
- Heterogeneous structured data (capabilities, pricing, changelog sections,
  specs, analysis) lives in `Json` columns rather than rigid tables, so new
  facts never require a migration.
- Every followable/savable thing uses the generic
  `{ entityType, entityId }` pattern.

## Taxonomies

**Category** — three flavors in one table (`@@unique([key, type])`):
`NEWS` (feed categories), `DOMAIN` (technology domains), `TOOL` (AI tool
directory categories). Keys are defined in `constants.ts`.

**Source** — human/machine origin of items with `type`
(OFFICIAL_DOCS / OFFICIAL_BLOG / GITHUB / CHANGELOG / RESEARCH / PUBLICATION /
COMMUNITY / ADVISORY), `reliability` 1–10, optional `feedUrl` and
`lastCheckedAt`.

## Core entities

| Model | Purpose | Notable fields |
| --- | --- | --- |
| `News` | One *story*; same-event stories share `clusterKey`, `isPrimary` marks the canonical/official one | `kind`, `importance`, `analysis` (Json: TL;DR / whatChanged / whyItMatters / whoAffected / whatToDo), `tags`, `engagement`, `publishedAt`, optional `releaseId` back-ref |
| `NewsTechnology` / `NewsCompany` | M:N links with a per-link `isPrimary` | |
| `Technology` | Languages, frameworks, databases, cloud, hardware… | `kind`, `details` (Json facts for Compare), `githubUrl`, `stars`, domain category, owning company |
| `Company` | OpenAI, Anthropic, Google… | `details` (stock, ceo, funding), `blogUrl`, `githubOrg`, `headquarters`, `founded` |
| `Release` | A versioned release of a technology | `version`, `previousVersion`, `kind` (MAJOR/MINOR/PATCH/SECURITY/BETA/RC), `changelog` (Json: highlights/breaking/fixes/security/performance/migration), `importance`, `announcedOn`, `notesUrl` |
| `AIModel` | Model specs for tracking + compare | `family` (groups versions), `status`, `contextWindow`, `maxOutput`, `capabilities` (Json booleans), `modalities`, `pricing` (Json per-1M-token), `benchmarks`, `openSource`, `apiAvailable`, `compare` (extra facts) |
| `AITool` | AI tool directory entry | `pricingModel`, `features`/`useCases`/`competitors` (Json arrays), `stack`, `primaryCategoryId` → TOOL category |
| `Repository` | GitHub repos with release/activity signals | `fullName` unique, `stars`, `forks`, `openIssues`, `contributors`, `latestRelease` (Json), `topics`, optional `technologyId` |
| `SecurityAdvisory` | CVE / advisory tracking | `cveId`, `severity`, `cvssScore`, `affected` / `fixedVersions` (Json `[{product, versions}]`), `recommendation`, `status` (ACTIVE/RESOLVED/UPDATED), optional technology link |
| `SourceItem` | Ingestion hash ledger | `urlHash` unique → nothing is ingested twice |
| `IngestionJob` | One pipeline run | `kind` (RSS/GITHUB/MANUAL/SEED/FULL), `status`, counts, `log` (Json), optional source |

## Personalization & chat

| Model | Purpose |
| --- | --- |
| `User` | Auth + `prefs` Json (dashboardCategories, notifPrefs, digest) |
| `Follow` | Watchlist — `@@unique([userId, entityType, entityId])` |
| `SavedItem` | Bookmarks — same shape as Follow |
| `Chat` / `Message` | Conversations; `Chat.meta` keeps `lastSubject` for follow-up grounding; `Message.sources` stores citations |
| `Notification` | Materialized alerts with per-user `fingerprint` dedupe (`@@unique([userId, fingerprint])`) and `readAt` |

## Entity vocabulary

`ENTITY_TYPE` in `constants.ts`: `TECHNOLOGY | COMPANY | AIMODEL | AITOOL |
REPOSITORY | NEWS | RELEASE | ADVISORY | TOPIC`. `src/lib/links.ts` maps an
`{entityType, entityId}` pair to a label + href — the single place that
defines deep-link routing for generic references (watchlist, saved,
notifications, chat citations).
