import Link from "next/link";
import type { Metadata } from "next";
import { Logo, Chip, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { NewsCardSlim, ReleaseCard, AdvisoryRow, ToolRowCard, ModelRowCard } from "@/components/cards";
import { topStories, queryReleases, categoryStats } from "@/lib/data";
import { startOfDayUTC } from "@/lib/utils";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Your AI-powered technology intelligence platform" };
export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: "flame", title: "Everything, dated", sub: "News, releases and advisories organized by date — today, yesterday, last 7 days, any range." },
  { icon: "brain", title: "AI models & tools directory", sub: "Context windows, pricing, capabilities and benchmarks — side-by-side comparisons." },
  { icon: "package", title: "Release tracker", sub: "Version-by-version changelogs for React, Node, Postgres, Kubernetes, frameworks and more." },
  { icon: "shield", title: "Security radar", sub: "CVEs and advisories with affected versions, fixes and what to do." },
  { icon: "bot", title: "TechPulse AI assistant", sub: "A technology-only assistant grounded in this knowledge base, with sources." },
  { icon: "star", title: "Watchlists & digest", sub: "Follow what you care about and get a daily digest of what changed." },
] as const;

export default async function HomePage() {
  const [top, releasesToday, cats, featuredTools, featuredModels, securityAlerts] = await Promise.all([
    topStories(2, 6),
    queryReleases({ from: startOfDayUTC(new Date()), take: 4 }),
    categoryStats(),
    prisma.aITool.findMany({ where: { isFeatured: true }, include: { company: true, primaryCategory: true }, orderBy: { launchDate: "desc" }, take: 3 }),
    prisma.aIModel.findMany({ where: { isFeatured: true }, include: { provider: true }, orderBy: { releasedOn: "desc" }, take: 3 }),
    prisma.securityAdvisory.findMany({ where: { severity: { in: ["CRITICAL", "HIGH"] } }, include: { technology: true }, orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="grid-bg relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-16 text-center sm:pt-24">
          <div className="mb-6 flex justify-center"><Logo size={34} /></div>
          <span className="panel inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-[color:var(--text-2)]">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Bloomberg Terminal × Product Hunt × ChatGPT — for technology
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            Stay ahead of
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> technology.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-[color:var(--text-2)] sm:text-base">
            Track AI, software releases, developer tools, security, cloud and everything changing in technology — organized by date,
            powered by an AI assistant that understands only technology.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/dashboard" variant="primary" size="md" className="h-10 px-5 text-sm">Explore today's tech <Icon name="arrow-right" size={15} /></LinkButton>
            <LinkButton href="/chat" variant="outline" size="md" className="h-10 px-5 text-sm"><Icon name="bot" size={15} /> Ask TechPulse AI</LinkButton>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[11.5px] text-[color:var(--text-3)]">
            {cats.slice(0, 10).map((c) => (
              <Link key={c.key} href={`/dashboard?cat=${c.key}`} className="no-underline"><Chip>{c.emoji} {c.name}</Chip></Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="panel panel-hover p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-violet-500/15 text-cyan-500 dark:text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
                <Icon name={f.icon} size={17} />
              </span>
              <h3 className="mt-3 text-[14.5px] font-semibold text-[color:var(--text)]">{f.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--text-2)]">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live sample */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Top stories right now</h2>
              <Link href="/news" className="text-[12px] text-[color:var(--text-3)] hover:text-cyan-500">All news →</Link>
            </div>
            <div className="panel divide-y divide-[color:var(--border)] px-4">
              {top.map((n) => <NewsCardSlim key={n.id} item={n} />)}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Latest releases</h2>
              <Link href="/releases" className="text-[12px] text-[color:var(--text-3)] hover:text-cyan-500">All releases →</Link>
            </div>
            <div className="space-y-3">
              {releasesToday.map((r) => <ReleaseCard key={r.id} item={r} />)}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div>
            <h2 className="mb-3 text-[15px] font-semibold">Security alerts</h2>
            <div className="space-y-3">{securityAlerts.map((a) => <AdvisoryRow key={a.id} a={a} />)}</div>
          </div>
          <div>
            <h2 className="mb-3 text-[15px] font-semibold">Featured AI models</h2>
            <div className="space-y-3">{featuredModels.map((m) => <ModelRowCard key={m.id} m={m} />)}</div>
          </div>
          <div>
            <h2 className="mb-3 text-[15px] font-semibold">AI tools to know</h2>
            <div className="space-y-3">{featuredTools.map((t) => <ToolRowCard key={t.id} t={t} />)}</div>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-cyan-500/[0.07] via-transparent to-violet-500/[0.09] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight">Spend 10 minutes. Know everything important.</h2>
          <p className="mx-auto mt-2 max-w-xl text-[13.5px] text-[color:var(--text-2)]">
            One platform for what changed in technology today — releases, models, tools, security and company moves —
            plus an assistant that answers only from this data, with citations.
          </p>
          <div className="mt-6 flex justify-center"><LinkButton href="/dashboard" variant="primary" className="h-10 px-5">Open the dashboard</LinkButton></div>
        </div>
      </section>
    </div>
  );
}
