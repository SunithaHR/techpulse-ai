import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsCardSlim } from "@/components/cards";
import { Chip, KindChip, ImportanceBadge, Card, ExternalLink, LinkButton, Meta, buttonCls } from "@/components/ui";
import { Icon } from "@/components/icons";
import { newsInclude } from "@/lib/data";
import { fmtDateTime, asObject, asArray, asString, cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { SaveButton, FollowButton } from "@/components/actions";
import { getSession } from "@/lib/auth";
import { NEWS_KIND, NEWS_KIND_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const n = await prisma.news.findUnique({ where: { id }, select: { title: true, summary: true } });
  return { title: n?.title ?? "News", description: n?.summary };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const item = await prisma.news.findUnique({ where: { id }, include: newsInclude });
  if (!item) notFound();
  const analysis = asObject<Record<string, string>>(item.analysis);
  const tags = asArray<string>(item.tags);

  // cluster siblings
  let siblings: Array<{ id: string; title: string; source: { name: string; type: string; reliability: number }; isPrimary: boolean; publishedAt: Date }> = [];
  if (item.clusterKey) {
    siblings = await prisma.news.findMany({
      where: { clusterKey: item.clusterKey, id: { not: item.id } },
      select: { id: true, title: true, isPrimary: true, publishedAt: true, source: { select: { name: true, type: true, reliability: true } } },
      orderBy: [{ isPrimary: "desc" }, { publishedAt: "asc" }],
    });
  }

  const [relatedNews, tech = null] = item.technologies.length
    ? await Promise.all([
        prisma.news.findMany({
          where: { technologies: { some: { technologyId: { in: item.technologies.map((t) => t.technologyId) } } }, isPrimary: true, id: { not: item.id } },
          include: newsInclude,
          orderBy: { publishedAt: "desc" },
          take: 5,
        }),
        Promise.resolve(null),
      ])
    : [[], null];

  const section = (title: string, body: string, icon: string) =>
    body.trim() ? (
      <div>
        <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]"><Icon name={icon} size={13} /> {title}</h2>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--text-2)]">{body}</p>
      </div>
    ) : null;

  const primaryTech = item.technologies.find((t) => t.isPrimary) ?? item.technologies[0];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/news" className="inline-flex items-center gap-1 text-[12.5px] text-[color:var(--text-3)] hover:text-cyan-500">
        <Icon name="chevron-right" size={13} className="rotate-180" /> All news
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <KindChip kind={item.kind} />
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: item.category.color }}>
            {item.category.emoji} {item.category.name}
          </span>
          <ImportanceBadge importance={item.importance} />
        </div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-[color:var(--text)] sm:text-[28px]">{item.title}</h1>
        <p className="text-[14.5px] leading-relaxed text-[color:var(--text-2)]">{item.summary}</p>
        <Meta>
          <span>{item.source.name}</span>
          <time dateTime={item.publishedAt.toISOString()}>{fmtDateTime(item.publishedAt)}</time>
          <span>{item.engagement.toLocaleString()} reach</span>
        </Meta>
        <div className="flex flex-wrap items-center gap-2 border-y border-[color:var(--border)] py-3">
          {item.companies.map((c) => (
            <Link key={c.companyId} href={`/companies/${c.company.slug}`} className="no-underline"><Chip tone="accent">{c.company.name}</Chip></Link>
          ))}
          {item.technologies.map((t) => (
            <Link key={t.technologyId} href={`/technologies/${t.technology.slug}`} className="no-underline"><Chip tone="brand">{t.technology.name}</Chip></Link>
          ))}
          {tags.slice(0, 6).map((t) => <Chip key={t}>#{t}</Chip>)}
          {session && (
            <span className="ml-auto flex items-center gap-1.5">
              <SaveButton entityType="NEWS" entityId={item.id} label={item.title.slice(0, 60)} />
              {primaryTech && <FollowButton entityType="TECHNOLOGY" entityId={primaryTech.technology.slug} label={primaryTech.technology.name} />}
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {section("TL;DR", item.summary, "zap")}
        {section("What changed", asString(analysis.whatChanged), "code2")}
        {section("Why it matters", asString(analysis.whyItMatters), "trending")}
        {section("Who is affected", asString(analysis.whoAffected), "users")}
        {section("What you should do", asString(analysis.whatToDo), "wand")}
      </div>

      {item.releaseId && (
        <Link href={`/releases/${item.releaseId}`} className="panel panel-hover flex items-center gap-4 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-500 ring-1 ring-inset ring-emerald-400/25"><Icon name="package" size={18} /></span>
          <div className="flex-1">
            <div className="text-[12px] text-[color:var(--text-3)]">Linked release</div>
            <div className="text-[14px] font-semibold text-[color:var(--text)]">See the full changelog for this release →</div>
          </div>
        </Link>
      )}

      {siblings.length > 0 && (
        <Card className="p-5">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="link" size={14} /> Also covering this story</h2>
          <p className="mt-1 text-[12px] text-[color:var(--text-3)]">Same event, other sources — the official one is marked.</p>
          <ul className="mt-3 space-y-2">
            {siblings.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                {s.isPrimary ? <Chip tone="brand">Official</Chip> : <Chip>Coverage</Chip>}
                <Link href={`/news/${s.id}`} className="flex-1 truncate text-[13px] font-medium text-[color:var(--text)] hover:text-cyan-500">{s.title}</Link>
                <span className="text-[11.5px] text-[color:var(--text-3)]">{s.source.name}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {item.url && (
        <div className="flex flex-wrap gap-2">
          <ExternalLink href={item.url} className={buttonCls("outline", "sm")}>Read original <Icon name="external-link" size={13} /></ExternalLink>
        </div>
      )}

      {relatedNews.length > 0 && (
        <div>
          <h2 className="mb-3 text-[15px] font-semibold">More on {tech ? "this technology" : "this topic"}</h2>
          <div className="panel divide-y divide-[color:var(--border)] px-4">
            {relatedNews.map((n) => <NewsCardSlim key={n.id} item={n} />)}
          </div>
        </div>
      )}
    </article>
  );
}
