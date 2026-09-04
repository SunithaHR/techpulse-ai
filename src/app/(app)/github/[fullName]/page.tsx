import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsCardSlim } from "@/components/cards";
import { Chip, Card, ExternalLink, SectionHeader, Stat, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { fmtDate, asArray, asObject, formatCount } from "@/lib/utils";
import { SaveButton, FollowButton } from "@/components/actions";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ fullName: string }> }): Promise<Metadata> {
  const { fullName } = await params;
  const r = await prisma.repository.findUnique({ where: { fullName } });
  return { title: r?.fullName ?? "Repository", description: r?.description };
}

export default async function RepoPage({ params }: { params: Promise<{ fullName: string }> }) {
  const { fullName } = await params;
  const session = await getSession();
  const repo = await prisma.repository.findUnique({ where: { fullName }, include: { technology: true } });
  if (!repo) notFound();

  const lr = asObject<{ tag?: string; name?: string; date?: string; notesUrl?: string }>(repo.latestRelease);
  const topics = asArray<string>(repo.topics);
  const relatedNews = repo.technology
    ? await prisma.news.findMany({
        where: { technologies: { some: { technologyId: repo.technology.id } }, isPrimary: true },
        include: { category: true, source: true, technologies: { take: 2, include: { technology: { select: { id: true, slug: true, name: true, accent: true, kind: true } } } }, companies: { take: 2, include: { company: { select: { id: true, slug: true, name: true, accent: true } } } } },
        orderBy: { publishedAt: "desc" },
        take: 6,
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/github" className="inline-flex items-center gap-1 text-[12.5px] text-[color:var(--text-3)] hover:text-cyan-500">
        <Icon name="chevron-right" size={13} className="rotate-180" /> All repositories
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[color:var(--text-2)]"><Icon name="github" size={26} /></span>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-[color:var(--text-3)]">{repo.owner}/</span>{repo.name}
          </h1>
          {repo.isFeatured && <Chip tone="brand">Featured</Chip>}
          {repo.language && <Chip>{repo.language}</Chip>}
          {repo.license && <Chip>{repo.license}</Chip>}
        </div>
        {repo.description && <p className="text-[14px] leading-relaxed text-[color:var(--text-2)]">{repo.description}</p>}
        <div className="flex flex-wrap items-center gap-2 border-y border-[color:var(--border)] py-3">
          {repo.technology && (
            <Link href={`/technologies/${repo.technology.slug}`} className="no-underline"><Chip tone="brand">{repo.technology.name}</Chip></Link>
          )}
          {topics.slice(0, 8).map((t) => <Chip key={t}>#{t}</Chip>)}
          {session && (
            <span className="ml-auto flex items-center gap-1.5">
              <SaveButton entityType="REPOSITORY" entityId={repo.fullName} label={repo.fullName} />
              <FollowButton entityType="REPOSITORY" entityId={repo.fullName} label={repo.fullName} />
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Stars" value={formatCount(repo.stars)} accent="#fbbf24" />
        <Stat label="Forks" value={formatCount(repo.forks)} />
        <Stat label="Open issues" value={formatCount(repo.openIssues)} />
        <Stat label="Contributors" value={formatCount(repo.contributors)} />
      </div>

      {lr.tag && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="package" size={14} className="text-emerald-400" /> Latest release</h2>
            {lr.date && <span className="text-[11.5px] text-[color:var(--text-3)]">{fmtDate(lr.date)}</span>}
          </div>
          <div className="mt-2 font-mono text-[18px] font-bold text-emerald-400">{lr.tag}</div>
          {lr.name && <div className="mt-0.5 text-[12.5px] text-[color:var(--text-2)]">{lr.name}</div>}
          <div className="mt-3 flex gap-2">
            {lr.notesUrl && <ExternalLink href={lr.notesUrl} className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--panel-2)] px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]">Release notes <Icon name="external-link" size={12} /></ExternalLink>}
            <ExternalLink href={`https://github.com/${repo.fullName}`} className="inline-flex items-center gap-1 rounded-lg bg-[color:var(--panel-2)] px-2.5 py-1.5 text-[12px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]"><Icon name="github" size={12} /> View on GitHub</ExternalLink>
          </div>
        </Card>
      )}

      {repo.homepage && (
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="globe" size={14} className="text-cyan-400" /> Homepage</h2>
          <ExternalLink href={repo.homepage} className="mt-1 block text-[13.5px] text-cyan-500 hover:underline">{repo.homepage}</ExternalLink>
        </Card>
      )}

      {relatedNews.length > 0 && (
        <section>
          <SectionHeader title="Related news" />
          <div className="panel divide-y divide-[color:var(--border)] px-4">
            {relatedNews.map((n) => <NewsCardSlim key={n.id} item={n} />)}
          </div>
        </section>
      )}

      {repo.lastSyncedAt && (
        <p className="text-center text-[11px] text-[color:var(--text-3)]">Last synced {fmtDate(repo.lastSyncedAt)}</p>
      )}
    </div>
  );
}