import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NewsCardSlim } from "@/components/cards";
import { BrandAvatar, Chip, Card, ExternalLink, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { toolDetail } from "@/lib/data";
import { prisma } from "@/lib/db";
import { FollowButton, SaveButton } from "@/components/actions";
import { getSession } from "@/lib/auth";
import { asArray, fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.aITool.findUnique({ where: { slug } });
  return { title: t?.name ?? "Tool", description: t?.description };
}

const PRICING_LABEL: Record<string, string> = {
  FREE: "Free", FREEMIUM: "Free / Paid", PAID: "Paid", ENTERPRISE: "Enterprise", OPEN_SOURCE: "Open source",
};

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const data = await toolDetail(slug);
  if (!data) notFound();
  const { tool, relatedNews } = data;
  const features = asArray<string>(tool.features);
  const useCases = asArray<string>(tool.useCases);
  const competitors = asArray<string>(tool.competitors);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        {tool.company ? (
          <BrandAvatar name={tool.company.name} accent={tool.company.accent} size={52} />
        ) : (
          <BrandAvatar name={tool.name} accent={tool.primaryCategory?.color} size={52} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
            {tool.primaryCategory && (
              <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: tool.primaryCategory.color }}>
                {tool.primaryCategory.emoji} {tool.primaryCategory.name}
              </span>
            )}
            <Chip>{PRICING_LABEL[tool.pricingModel] ?? tool.pricingModel}</Chip>
            {tool.status !== "LIVE" && <Chip tone="accent">{tool.status}</Chip>}
          </div>
          <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--text-2)]">{tool.description}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[color:var(--text-3)]">
            {tool.company && (
              <Link href={`/companies/${tool.company.slug}`} className="inline-flex items-center gap-1.5 hover:text-cyan-500">
                <Icon name="building-2" size={12} /> {tool.company.name}
              </Link>
            )}
            {tool.launchDate && <span>Launched {fmtDate(tool.launchDate)}</span>}
            {tool.latestUpdate && <span>Updated {fmtDate(tool.latestUpdate)}</span>}
            {tool.apiAvailable && <span className="inline-flex items-center gap-1 text-emerald-500"><Icon name="check-circle" size={12} /> API available</span>}
            {tool.website && <ExternalLink href={tool.website}>Website</ExternalLink>}
            {tool.docsUrl && <ExternalLink href={tool.docsUrl}>Docs</ExternalLink>}
            {tool.githubUrl && <ExternalLink href={tool.githubUrl}><Icon name="github" size={12} /> GitHub</ExternalLink>}
          </div>
        </div>
        {session && (
          <div className="flex items-center gap-1.5">
            <FollowButton entityType="AITOOL" entityId={tool.slug} label={tool.name} />
            <SaveButton entityType="AITOOL" entityId={tool.slug} label={tool.name} />
          </div>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {features.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="zap" size={14} className="text-cyan-400" /> Key features</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-[color:var(--panel-2)] px-3 py-2.5 text-[12.5px] text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)]">
                    <Icon name="check" size={13} className="mt-0.5 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {useCases.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="trending" size={14} className="text-violet-400" /> Use cases</h2>
              <div className="flex flex-wrap gap-1.5">
                {useCases.map((u, i) => <Chip key={i}>{u}</Chip>)}
              </div>
            </Card>
          )}
          {tool.stack && (
            <Card className="p-5">
              <h2 className="mb-1 flex items-center gap-2 text-[13px] font-semibold"><Icon name="layers" size={14} className="text-amber-400" /> Technology stack</h2>
              <p className="font-mono text-[12.5px] text-[color:var(--text-2)]">{tool.stack}</p>
            </Card>
          )}
        </div>
        <div className="space-y-4 lg:col-span-2">
          {competitors.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="scale" size={14} className="text-rose-400" /> Competitors</h2>
              <div className="flex flex-wrap gap-1.5">
                {competitors.map((c, i) => <Chip key={i} tone="accent">{c}</Chip>)}
              </div>
            </Card>
          )}
          {relatedNews.length > 0 && (
            <div>
              <SectionHeader title="Related news" />
              <div className="panel divide-y divide-[color:var(--border)] px-4">
                {relatedNews.map((n) => <NewsCardSlim key={n.id} item={n} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}