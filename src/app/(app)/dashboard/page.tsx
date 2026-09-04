import Link from "next/link";
import type { Metadata } from "next";
import { NewsCardItem, NewsCardSlim, ReleaseCard, AdvisoryRow } from "@/components/cards";
import { SectionHeader, Chip, Stat, LinkButton, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { queryNews, newsTimeline, queryReleases, categoryStats, overviewStats, type NewsDayGroup } from "@/lib/data";
import { NEWS_CATEGORIES, IMPORTANCE_LABEL } from "@/lib/constants";
import { startOfDayUTC, daysAgo, cn } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

const IMPORTANCE_FILTERS = ["ALL", "CRITICAL", "HIGH", "MEDIUM"] as const;
const RANGE_PRESETS = [
  { v: "0", label: "Today" },
  { v: "1", label: "Yesterday" },
  { v: "7", label: "7 days" },
];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ cat?: string; imp?: string; d?: string }> }) {
  const sp = await searchParams;
  const cat = sp.cat ?? "all";
  const imp = (sp.imp ?? "all").toUpperCase();
  const days = Math.min(30, Math.max(0, parseInt(sp.d ?? "0", 10) || 0));

  const session = await getSession();
  const stats = await overviewStats();
  const cats = await categoryStats();

  const groups: NewsDayGroup[] = days === 0
    ? await newsTimeline(1, { category: cat !== "all" ? cat : undefined, importance: imp !== "ALL" && IMPORTANCE_FILTERS.includes(imp as never) ? imp : undefined })
    : await newsTimeline(days + 1, { category: cat !== "all" ? cat : undefined, importance: imp !== "ALL" && IMPORTANCE_FILTERS.includes(imp as never) ? imp : undefined });

  const [todayReleases, todayAdvisories] = await Promise.all([
    queryReleases({ from: startOfDayUTC(daysAgo(days)), take: 6 }),
    prisma.securityAdvisory.findMany({ where: { publishedAt: { gte: startOfDayUTC(daysAgo(days)) } }, include: { technology: true }, orderBy: [{ severity: "asc" }, { publishedAt: "desc" }], take: 4 }),
  ]);

  // Personalization: followed techs get a "For you" strip
  let forYou: { slug: string; name: string; item: { id: string; title: string } }[] = [];
  if (session) {
    const follows = await prisma.follow.findMany({ where: { userId: session.sub, entityType: "TECHNOLOGY" } });
    for (const f of follows.slice(0, 8)) {
      const item = await prisma.news.findFirst({
        where: { technologies: { some: { technology: { slug: f.entityId } } }, isPrimary: true },
        orderBy: [{ importance: "asc" }, { publishedAt: "desc" }],
        select: { id: true, title: true },
      });
      if (item) forYou.push({ slug: f.entityId, name: f.label ?? f.entityId, item });
    }
  }

  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);
  const catName = cat === "all" ? "All" : (NEWS_CATEGORIES.find((c) => c.key === cat)?.name ?? "All");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Today's technology pulse</h1>
          <p className="mt-1 text-[13px] text-[color:var(--text-2)]">
            {totalItems} updates · {catName} · {days === 0 ? "today" : days === 1 ? "yesterday" : `last ${days + 1} days`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton href="/chat" size="sm"><Icon name="bot" size={13} /> Ask TechPulse AI</LinkButton>
          <LinkButton href="/timeline" variant="outline" size="sm"><Icon name="calendar-range" size={13} /> Timeline</LinkButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Updates tracked" value={stats.news} hint="News & stories" />
        <Stat label="Releases" value={stats.releases} hint={`${stats.critical} critical stories`} accent="#fb7185" />
        <Stat label="AI models" value={stats.models} hint="Tracked & compared" />
        <Stat label="Advisories" value={stats.advisories} hint="Security notices" />
      </div>

      {/* Range + filters */}
      <div className="panel p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {RANGE_PRESETS.map((r) => (
            <FilterChip key={r.v} active={String(days) === r.v} href={`/dashboard?cat=${cat}&imp=${imp.toLowerCase()}&d=${r.v}`}>{r.label}</FilterChip>
          ))}
          <span className="mx-1.5 h-4 w-px bg-[color:var(--border)]" />
          {IMPORTANCE_FILTERS.map((f) => (
            <FilterChip key={f} active={imp === f} href={`/dashboard?cat=${cat}&imp=${f.toLowerCase()}&d=${days}`}>{f === "ALL" ? "All importance" : IMPORTANCE_LABEL[f as keyof typeof IMPORTANCE_LABEL]}</FilterChip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[color:var(--border)] pt-2.5">
          <FilterChip active={cat === "all"} href={`/dashboard?cat=all&imp=${imp.toLowerCase()}&d=${days}`}>All categories</FilterChip>
          {cats.slice(0, 14).map((c) => (
            <FilterChip key={c.key} active={cat === c.key} href={`/dashboard?cat=${c.key}&imp=${imp.toLowerCase()}&d=${days}`} color={c.color}>
              {c.emoji} {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* For you strip */}
      {forYou.length > 0 && (
        <div>
          <SectionHeader
            title={<>For you</>}
            sub="Latest on technologies you follow"
            right={<Link href="/watchlist" className="text-[12px] text-[color:var(--text-3)] hover:text-cyan-500">Manage watchlist →</Link>}
            icon={<Icon name="sparkles" size={15} className="text-violet-400" />}
          />
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {forYou.map((f) => (
              <Link key={f.slug} href={`/news/${f.item.id}`} className="panel panel-hover w-60 shrink-0 p-3.5">
                <Chip tone="brand">{f.name}</Chip>
                <div className="mt-2 line-clamp-2 text-[12.8px] font-medium leading-snug text-[color:var(--text)]">{f.item.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        {/* Main feed */}
        <div className="min-w-0 space-y-8">
          {groups.length === 0 && (
            <EmptyState
              icon={<Icon name="inbox" size={26} />}
              title="Nothing in this view yet"
              sub="Try widening the date range or clearing filters."
              action={<LinkButton href="/dashboard">Clear filters</LinkButton>}
            />
          )}
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--text-2)]">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> {g.day === "today" ? "Today" : g.label === "Yesterday" ? "Yesterday" : g.day}
                <span className="rounded bg-[color:var(--panel-2)] px-1.5 py-px text-[10.5px] font-medium text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)]">{g.items.length}</span>
              </h2>
              <div className="space-y-3">
                {g.items.slice(0, 30).map((n) => <NewsCardItem key={n.id} item={n} />)}
              </div>
            </section>
          ))}
        </div>

        {/* Right rail */}
        <aside className="min-w-0 space-y-6">
          <div>
            <SectionHeader title="Latest releases" icon={<Icon name="package" size={15} className="text-emerald-400" />} right={<Link href="/releases" className="text-[12px] text-[color:var(--text-3)] hover:text-cyan-500">All →</Link>} />
            <div className="space-y-2.5">
              {todayReleases.map((r) => <ReleaseCard key={r.id} item={r} />)}
              {todayReleases.length === 0 && <p className="text-[12.5px] text-[color:var(--text-3)]">No releases in this window.</p>}
            </div>
          </div>
          {todayAdvisories.length > 0 && (
            <div>
              <SectionHeader title="Security" icon={<Icon name="shield" size={15} className="text-red-400" />} right={<Link href="/security" className="text-[12px] text-[color:var(--text-3)] hover:text-cyan-500">All →</Link>} />
              <div className="space-y-2.5">{todayAdvisories.map((a) => <AdvisoryRow key={a.id} a={a} />)}</div>
            </div>
          )}
          <div>
            <SectionHeader title="Trending tech" icon={<Icon name="trending" size={15} className="text-orange-400" />} right={<Link href="/technologies" className="text-[12px] text-[color:var(--text-3)] hover:text-cyan-500">All →</Link>} />
            <div className="panel divide-y divide-[color:var(--border)] px-4">
              {(await prisma.technology.findMany({ where: { isFeatured: true }, take: 6 })).map((t, i) => (
                <Link key={t.id} href={`/technologies/${t.slug}`} className="flex items-center gap-3 py-2.5">
                  <span className="w-4 font-mono text-[11px] text-[color:var(--text-3)]">{i + 1}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: t.accent }} />
                  <span className="flex-1 truncate text-[13px] font-medium text-[color:var(--text)]">{t.name}</span>
                  <Icon name="chevron-right" size={14} className="text-[color:var(--text-3)]" />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilterChip({ children, active, href, color }: { children: React.ReactNode; active?: boolean; href: string; color?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
        active ? "bg-cyan-400/12 text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:text-cyan-300" : "text-[color:var(--text-2)] hover:bg-[color:var(--hover)]",
      )}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </Link>
  );
}
