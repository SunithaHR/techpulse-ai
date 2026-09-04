import type { Metadata } from "next";
import Link from "next/link";
import { NewsCardSlim, ReleaseCard } from "@/components/cards";
import { Card, SectionHeader, SeverityBadge, Chip } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { topStories } from "@/lib/data";
import { fmtDate, startOfDayUTC, daysAgo } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Digest" };
export const dynamic = "force-dynamic";

export default async function DigestPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const sp = await searchParams;
  const scope = sp.scope === "WEEKLY" ? "WEEKLY" : "DAILY";
  const days = scope === "WEEKLY" ? 7 : 1;

  const [top, releases, advisories, models, tools] = await Promise.all([
    topStories(days, 6),
    prisma.release.findMany({
      where: { announcedOn: { gte: startOfDayUTC(daysAgo(days - 1)) } },
      include: { technology: { select: { id: true, slug: true, name: true, accent: true, kind: true, githubUrl: true, website: true } }, company: { select: { id: true, slug: true, name: true, accent: true } }, _count: { select: { news: true } } },
      orderBy: [{ importance: "asc" }, { announcedOn: "desc" }],
      take: 8,
    }),
    prisma.securityAdvisory.findMany({
      where: { publishedAt: { gte: startOfDayUTC(daysAgo(days - 1)) } },
      include: { technology: { select: { slug: true, name: true } } },
      orderBy: [{ severity: "asc" }, { publishedAt: "desc" }],
      take: 6,
    }),
    prisma.aIModel.findMany({ where: { releasedOn: { gte: startOfDayUTC(daysAgo(days - 1)) } }, include: { provider: { select: { slug: true, name: true } } }, orderBy: { releasedOn: "desc" }, take: 5 }),
    prisma.aITool.findMany({ where: { launchDate: { gte: startOfDayUTC(daysAgo(days - 1)) } }, include: { company: true }, orderBy: { launchDate: "desc" }, take: 5 }),
  ]);

  const digestCats = await Promise.all(
    NEWS_CATEGORIES.filter((c) => c.key === "ai" || c.key === "dev" || c.key === "cloud" || c.key === "security" || c.key === "db" || c.key === "tools").map(async (cat) => {
      const items = await prisma.news.findMany({
        where: { isPrimary: true, category: { key: cat.key }, publishedAt: { gte: startOfDayUTC(daysAgo(days - 1)) } },
        include: { category: true, source: true, technologies: { take: 2, include: { technology: { select: { id: true, slug: true, name: true, accent: true, kind: true } } } }, companies: { take: 2, include: { company: { select: { id: true, slug: true, name: true, accent: true } } } } },
        orderBy: { importance: "asc" },
        take: 3,
      });
      return { cat, items };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white"><Icon name="newspaper" size={18} /></span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">TechPulse {scope === "WEEKLY" ? "Week in Review" : "Daily"}</h1>
              <p className="text-[12.5px] text-[color:var(--text-3)]">{fmtDate(new Date())} · {scope === "WEEKLY" ? "the last 7 days, summarized" : "what matters today"}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(["DAILY", "WEEKLY"] as const).map((s) => (
              <Link key={s} href={`/digest?scope=${s}`}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ring-1 ring-inset ${scope === s ? "bg-cyan-400/12 text-cyan-600 ring-cyan-400/35 dark:text-cyan-300" : "bg-[color:var(--panel-2)] text-[color:var(--text-2)] ring-[color:var(--border)]"}`}>
                {s === "DAILY" ? "Daily" : "Weekly"}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Top stories */}
      <section>
        <SectionHeader title={`🔥 Top ${scope === "WEEKLY" ? "stories of the week" : "stories today"}`} />
        <div className="grid gap-2.5">
          {top.map((n, i) => (
            <Link key={n.id} href={`/news/${n.id}`} className="panel panel-hover flex items-center gap-4 p-4 no-underline">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-400/20 font-mono text-[15px] font-bold text-amber-500 ring-1 ring-inset ring-amber-400/25">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold text-[color:var(--text)]">{n.title}</div>
                <div className="mt-0.5 line-clamp-1 text-[12px] text-[color:var(--text-3)]">{n.summary}</div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Chip>{n.importance}</Chip>
                <span className="text-[11px] text-[color:var(--text-3)]">{n.source.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* By category */}
      <section>
        <SectionHeader title="📰 By category" />
        <div className="grid gap-3 sm:grid-cols-2">
          {digestCats.filter(({ items }) => items.length > 0).map(({ cat, items }) => (
            <Card key={cat.key} className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold" style={{ color: cat.color }}>
                {cat.emoji} {cat.name}
              </h3>
              <div className="divide-y divide-[color:var(--border)]">
                {items.map((n) => <NewsCardSlim key={n.id} item={n} />)}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Releases */}
      {releases.length > 0 && (
        <section>
          <SectionHeader title="📦 Releases" right={<Link href="/releases?range=7" className="text-[12px] text-cyan-500 hover:underline">All releases →</Link>} />
          <div className="grid gap-3 lg:grid-cols-2">
            {releases.map((r) => <ReleaseCard key={r.id} item={r} />)}
          </div>
        </section>
      )}

      {/* Security */}
      {advisories.length > 0 && (
        <section>
          <SectionHeader title="🔐 Security" right={<Link href="/security" className="text-[12px] text-cyan-500 hover:underline">All advisories →</Link>} />
          <div className="space-y-2">
            {advisories.map((a) => (
              <Link key={a.id} href={`/security/${a.id}`} className="panel panel-hover flex flex-wrap items-center gap-3 p-4 no-underline">
                <SeverityBadge severity={a.severity} />
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-[color:var(--text)]">{a.cveId ? `${a.cveId} — ` : ""}{a.title}</span>
                {a.technology && <Chip tone="brand">{a.technology.name}</Chip>}
                <span className="text-[11.5px] text-[color:var(--text-3)]">{fmtDate(a.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI */}
      {(models.length > 0 || tools.length > 0) && (
        <section>
          <SectionHeader title="🧠 AI" right={<Link href="/ai" className="text-[12px] text-cyan-500 hover:underline">AI hub →</Link>} />
          <div className="grid gap-3 sm:grid-cols-2">
            {models.length > 0 && (
              <Card className="p-4">
                <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-violet-400">New models</h3>
                <ul className="space-y-2">
                  {models.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <Link href={`/ai/models/${m.slug}`} className="truncate font-medium text-[color:var(--text)] hover:text-cyan-500">{m.name}</Link>
                      <span className="shrink-0 text-[11px] text-[color:var(--text-3)]">{m.provider.name}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {tools.length > 0 && (
              <Card className="p-4">
                <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-cyan-400">New tools</h3>
                <ul className="space-y-2">
                  {tools.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <Link href={`/ai/tools/${t.slug}`} className="truncate font-medium text-[color:var(--text)] hover:text-cyan-500">{t.name}</Link>
                      <span className="shrink-0 text-[11px] text-[color:var(--text-3)]">{t.company?.name ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </section>
      )}

      <p className="text-center text-[11px] text-[color:var(--text-3)]">
        Generated from the TechPulse knowledge base · enable daily digests in <Link href="/settings" className="text-cyan-500 hover:underline">Settings</Link> to get this delivered
      </p>
    </div>
  );
}