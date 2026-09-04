import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsCardSlim, ReleaseCard, AdvisoryRow } from "@/components/cards";
import { BrandAvatar, Chip, Card, ExternalLink, SectionHeader, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";
import { techDetail } from "@/lib/data";
import { prisma } from "@/lib/db";
import { FollowButton, SaveButton } from "@/components/actions";
import { getSession } from "@/lib/auth";
import { asObject } from "@/lib/utils";
import { TECH_KIND_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.technology.findUnique({ where: { slug } });
  return { title: t?.name ?? "Technology", description: t?.description };
}

export default async function TechPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const data = await techDetail(slug);
  if (!data) notFound();
  const { tech, releases, news, advisories, repo } = data;
  const details = asObject<Record<string, string>>(tech.details);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        <BrandAvatar name={tech.name} accent={tech.accent} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{tech.name}</h1>
            {tech.category && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: tech.category.color }}>
                {tech.category.emoji} {tech.category.name}
              </span>
            )}
            <Chip>{TECH_KIND_LABEL[tech.kind] ?? tech.kind}</Chip>
            {tech.isFeatured && <Chip tone="brand">Featured</Chip>}
          </div>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--text-2)]">{tech.description}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-3)]">
            {tech.company && (
              <Link href={`/companies/${tech.company.slug}`} className="inline-flex items-center gap-1.5 hover:text-cyan-500">
                <Icon name="building-2" size={12} /> {tech.company.name}
              </Link>
            )}
            {tech.license && <span>{tech.license}</span>}
            <Stars n={tech.stars} />
            {tech.website && <ExternalLink href={tech.website}>Website</ExternalLink>}
            {tech.docsUrl && <ExternalLink href={tech.docsUrl}>Docs</ExternalLink>}
            {tech.githubUrl && <ExternalLink href={tech.githubUrl}><Icon name="github" size={12} /> GitHub</ExternalLink>}
            {releases.length > 0 && (
              <span className="font-mono text-[11.5px]">latest <span className="text-cyan-500">{releases[0].version}</span> · {releases[0].announcedOn.toISOString().slice(0, 10)}</span>
            )}
          </div>
        </div>
        {session && (
          <div className="flex items-center gap-1.5">
            <FollowButton entityType="TECHNOLOGY" entityId={tech.slug} label={tech.name} />
            <SaveButton entityType="TECHNOLOGY" entityId={tech.slug} label={tech.name} />
          </div>
        )}
      </header>

      {Object.keys(details).length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(details).map(([k, v]) => (
            <div key={k} className="panel px-4 py-3">
              <div className="text-[10.5px] font-medium uppercase tracking-wider text-[color:var(--text-3)]">{k.replace(/([A-Z])/g, " $1")}</div>
              <div className="mt-1 truncate text-[13px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
      )}

      <section>
        <SectionHeader title="Releases" right={<Link href={`/releases?tech=${tech.slug}`} className="text-[12px] text-cyan-500 hover:underline">All releases →</Link>} />
        <div className="grid gap-3 lg:grid-cols-2">
          {releases.length === 0 && <p className="text-[12.5px] text-[color:var(--text-3)]">No tracked releases yet.</p>}
          {releases.map((r) => <ReleaseCard key={r.id} item={r} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="News" right={<Link href={`/news?tech=${tech.slug}`} className="text-[12px] text-cyan-500 hover:underline">All news →</Link>} />
        <div className="panel divide-y divide-[color:var(--border)] px-4">
          {news.length === 0 && <p className="py-6 text-center text-[12.5px] text-[color:var(--text-3)]">No recent news.</p>}
          {news.map((n) => <NewsCardSlim key={n.id} item={n} />)}
        </div>
      </section>

      {advisories.length > 0 && (
        <section>
          <SectionHeader title="Security advisories" right={<Link href={`/security?tech=${tech.slug}`} className="text-[12px] text-cyan-500 hover:underline">All advisories →</Link>} />
          <div className="grid gap-3 lg:grid-cols-2">
            {advisories.map((a) => <AdvisoryRow key={a.id} a={a} />)}
          </div>
        </section>
      )}

      {repo && (
        <Card className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--panel-2)] text-[color:var(--text-2)]"><Icon name="github" size={20} /></span>
          <div className="min-w-0 flex-1">
            <Link href={`/github/${repo.fullName}`} className="text-[14px] font-semibold hover:text-cyan-500">{repo.fullName}</Link>
            <div className="mt-0.5 flex items-center gap-3 text-[12px] text-[color:var(--text-3)]">
              <Stars n={repo.stars} /> {repo.language && <span>{repo.language}</span>} {repo.openIssues != null && <span>{repo.openIssues} issues</span>}
            </div>
          </div>
          <Stars n={repo.stars} className="text-[13px]" />
        </Card>
      )}

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="sparkles" size={14} className="text-violet-400" /> Ask TechPulse about {tech.name}</h2>
        <p className="mt-1 text-[12.5px] text-[color:var(--text-2)]">Latest changes, breaking changes, upgrade guidance and ecosystem context — grounded in tracked data.</p>
        <Link href={`/chat?q=${encodeURIComponent(`What changed recently in ${tech.name}?`)}`} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-500 to-cyan-600 px-3 py-2 text-[12.5px] font-medium text-white hover:from-cyan-400">
          <Icon name="bot" size={14} /> Ask in AI Chat
        </Link>
      </Card>
    </div>
  );
}