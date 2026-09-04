import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsCardSlim, ModelRowCard, ToolRowCard, ReleaseCard } from "@/components/cards";
import { BrandAvatar, Chip, Card, ExternalLink, Meta, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { companyDetail } from "@/lib/data";
import { prisma } from "@/lib/db";
import { FollowButton, SaveButton } from "@/components/actions";
import { getSession } from "@/lib/auth";
import { asObject } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.company.findUnique({ where: { slug } });
  return { title: c?.name ?? "Company", description: c?.description };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const data = await companyDetail(slug);
  if (!data) notFound();
  const { company, models, tools, news, releases, techs } = data;
  const details = asObject<Record<string, string>>(company.details);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        <BrandAvatar name={company.name} accent={company.accent} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
            {company.isFeatured && <Chip tone="brand">Featured</Chip>}
          </div>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--text-2)]">{company.description}</p>
          <Meta className="mt-2.5">
            {company.headquarters && <span>📍 {company.headquarters}</span>}
            {company.founded && <span>Founded {company.founded}</span>}
            {details.ceo && <span>CEO {details.ceo}</span>}
            {details.stock && <span className="font-mono">{details.stock}</span>}
            {company.website && <ExternalLink href={company.website}>Website</ExternalLink>}
            {company.githubOrg && <ExternalLink href={`https://github.com/${company.githubOrg}`}><Icon name="github" size={12} /> GitHub</ExternalLink>}
            {company.blogUrl && <ExternalLink href={company.blogUrl}>Blog</ExternalLink>}
          </Meta>
        </div>
        {session && (
          <div className="flex items-center gap-1.5">
            <FollowButton entityType="COMPANY" entityId={company.slug} label={company.name} />
            <SaveButton entityType="COMPANY" entityId={company.slug} label={company.name} />
          </div>
        )}
      </header>

      {details.funding && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Funding", details.funding], ["Headquarters", company.headquarters ?? "—"], ["Founded", String(company.founded ?? "—")], ["Stock", details.stock ?? "Private"]].map(([k, v]) => (
            <div key={k} className="panel px-4 py-3">
              <div className="text-[10.5px] font-medium uppercase tracking-wider text-[color:var(--text-3)]">{k}</div>
              <div className="mt-1 truncate text-[14px] font-semibold">{v}</div>
            </div>
          ))}
        </div>
      )}

      <section>
        <SectionHeader title="Latest news" right={<Link href={`/news?company=${company.slug}`} className="text-[12px] text-cyan-500 hover:underline">View all →</Link>} />
        <div className="panel divide-y divide-[color:var(--border)] px-4">
          {news.length === 0 && <p className="py-6 text-center text-[12.5px] text-[color:var(--text-3)]">No recent news.</p>}
          {news.map((n) => <NewsCardSlim key={n.id} item={n} />)}
        </div>
      </section>

      {models.length > 0 && (
        <section>
          <SectionHeader title="AI models" right={<Link href={`/ai/models?company=${company.slug}`} className="text-[12px] text-cyan-500 hover:underline">All models →</Link>} />
          <div className="grid gap-3 lg:grid-cols-2">
            {models.map((m) => <ModelRowCard key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section>
          <SectionHeader title="AI tools" right={<Link href={`/ai/tools?company=${company.slug}`} className="text-[12px] text-cyan-500 hover:underline">All tools →</Link>} />
          <div className="grid gap-3 lg:grid-cols-2">
            {tools.map((t) => <ToolRowCard key={t.id} t={t} />)}
          </div>
        </section>
      )}

      {releases.length > 0 && (
        <section>
          <SectionHeader title="Releases" />
          <div className="grid gap-3 lg:grid-cols-2">
            {releases.map((r) => <ReleaseCard key={r.id} item={r} />)}
          </div>
        </section>
      )}

      {techs.length > 0 && (
        <section>
          <SectionHeader title="Technologies" />
          <div className="flex flex-wrap gap-2">
            {techs.map((t) => (
              <Link key={t.id} href={`/technologies/${t.slug}`} className="no-underline"><Chip tone="brand">{t.name}</Chip></Link>
            ))}
          </div>
        </section>
      )}

      <Card className="p-5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="sparkles" size={14} className="text-violet-400" /> Ask TechPulse about {company.name}</h2>
        <p className="mt-1 text-[12.5px] text-[color:var(--text-2)]">
          Get a grounded briefing on {company.name}: recent releases, model launches, API changes and developer impact.
        </p>
        <Link href={`/chat?q=${encodeURIComponent(`What's new at ${company.name}?`)}`} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-500 to-cyan-600 px-3 py-2 text-[12.5px] font-medium text-white hover:from-cyan-400">
          <Icon name="bot" size={14} /> Ask in AI Chat
        </Link>
      </Card>
    </div>
  );
}