import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { releaseInclude, queryNews } from "@/lib/data";
import { Chip, ImportanceBadge, Card, ExternalLink, LinkButton, Meta, BrandAvatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { NewsCardSlim } from "@/components/cards";
import { fmtDate, asObject, asArray, cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { RELEASE_KIND_LABEL, IMPORTANCE_LABEL } from "@/lib/constants";
import { FollowButton, SaveButton } from "@/components/actions";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await prisma.release.findUnique({ where: { id }, include: { technology: { select: { name: true } } } });
  return { title: r ? `${r.technology.name} ${r.version}` : "Release" };
}

export default async function ReleaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const rel = await prisma.release.findUnique({ where: { id }, include: releaseInclude });
  if (!rel) notFound();
  const log = asObject<Record<string, string[]>>(rel.changelog);
  const tech = rel.technology;
  const news = await queryNews({ q: `${tech.name} ${rel.version}`, primaryOnly: true, take: 5 });
  const prev = rel.previousVersion
    ? await prisma.release.findFirst({ where: { technologyId: tech.id, version: rel.previousVersion } }).catch(() => null)
    : null;

  const rows: { key: string; title: string; items: string[]; icon: string }[] = [
    { key: "highlights", title: "What's new", items: asArray<string>(log.highlights ?? []), icon: "zap" },
    { key: "breaking", title: "Breaking changes", items: asArray<string>(log.breaking ?? []), icon: "alert" },
    { key: "security", title: "Security fixes", items: asArray<string>(log.security ?? []), icon: "lock" },
    { key: "fixes", title: "Bug fixes", items: asArray<string>(log.fixes ?? []), icon: "bug" },
    { key: "performance", title: "Performance", items: asArray<string>(log.performance ?? []), icon: "trending" },
    { key: "migration", title: "Migration", items: asArray<string>(log.migration ?? []), icon: "wand" },
  ].filter((r) => r.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/releases" className="inline-flex items-center gap-1 text-[12.5px] text-[color:var(--text-3)] hover:text-cyan-500">
        <Icon name="chevron-right" size={13} className="rotate-180" /> All releases
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/technologies/${tech.slug}`}><BrandAvatar name={tech.name} accent={tech.accent} size={38} /></Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--text)]">{tech.name} <span className="font-mono">{rel.version}</span></h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[color:var(--text-3)]">
              <span>{fmtDate(rel.announcedOn)}</span>
              <span>·</span>
              <span>{RELEASE_KIND_LABEL[rel.kind] ?? rel.kind}</span>
              {rel.company && <Link href={`/companies/${rel.company.slug}`} className="hover:text-cyan-500">· {rel.company.name}</Link>}
              {prev && <span>· previous: <Link href={`/releases/${prev.id}`} className="font-mono hover:text-cyan-500">{rel.previousVersion}</Link></span>}
            </div>
          </div>
          <div className="ml-auto"><ImportanceBadge importance={rel.importance} /></div>
        </div>

        {rel.summary && <p className="text-[14px] leading-relaxed text-[color:var(--text-2)]">{rel.summary}</p>}

        <div className="flex flex-wrap items-center gap-2 border-y border-[color:var(--border)] py-3">
          {tech.githubUrl && <ExternalLink href={tech.githubUrl} className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--panel-2)] px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:ring-[color:var(--border-strong)]"><Icon name="github" size={14} /> GitHub</ExternalLink>}
          {tech.website && <ExternalLink href={tech.website} className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--panel-2)] px-3 py-1.5 text-[12.5px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:ring-[color:var(--border-strong)]"><Icon name="globe" size={14} /> Website</ExternalLink>}
          {session && (
            <span className="ml-auto flex items-center gap-1.5">
              <FollowButton entityType="TECHNOLOGY" entityId={tech.slug} label={tech.name} />
              <SaveButton entityType="RELEASE" entityId={rel.id} label={`${tech.name} ${rel.version}`} />
            </span>
          )}
        </div>
      </header>

      {rows.length === 0 && (
        <Card className="p-5 text-[13px] text-[color:var(--text-2)]">Release notes for this version are concise — see the source link above for the official notes.</Card>
      )}

      <div className="space-y-5">
        {rows.map((r) => (
          <div key={r.key}>
            <h2 className={cn("flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider",
              r.key === "breaking" && "text-orange-500/90", r.key === "security" && "text-red-400/90", r.key !== "breaking" && r.key !== "security" && "text-[color:var(--text-3)]")}>
              <Icon name={r.icon} size={13} /> {r.title}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {r.items.map((it, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-[13px] leading-relaxed text-[color:var(--text-2)]">
                  <Icon name="chevron-right" size={12} className="mt-1 shrink-0 text-[color:var(--text-3)]" /> {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Card className="p-4">
        <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="flame" size={14} /> Coverage</h2>
        {news.length === 0 ? (
          <p className="text-[12.5px] text-[color:var(--text-3)]">No story coverage tracked for this release yet.</p>
        ) : (
          <div className="divide-y divide-[color:var(--border)]">
            {news.map((n) => <NewsCardSlim key={n.id} item={n} />)}
          </div>
        )}
      </Card>

      <Link href={`/technologies/${tech.slug}`} className={cn("panel panel-hover flex items-center gap-3 p-4")}>
        <span className="flex-1 text-[13.5px] font-medium text-[color:var(--text)]">See the full {tech.name} history — releases, news and advisories</span>
        <Icon name="arrow-right" size={15} className="text-[color:var(--text-3)]" />
      </Link>
    </div>
  );
}
