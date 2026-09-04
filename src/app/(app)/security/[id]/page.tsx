import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SeverityBadge, Chip, Card, ExternalLink, Meta } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { fmtDateTime, asArray } from "@/lib/utils";
import { SaveButton, FollowButton } from "@/components/actions";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = await prisma.securityAdvisory.findUnique({ where: { id } });
  return { title: a?.cveId ? `${a.cveId} — ${a.title}` : a?.title ?? "Advisory", description: a?.description };
}

export default async function AdvisoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const a = await prisma.securityAdvisory.findUnique({
    where: { id },
    include: { technology: true, source: true },
  });
  if (!a) notFound();

  const affected = asArray<{ product?: string; versions?: string }>(a.affected);
  const fixed = asArray<{ product?: string; versions?: string }>(a.fixedVersions);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/security" className="inline-flex items-center gap-1 text-[12.5px] text-[color:var(--text-3)] hover:text-cyan-500">
        <Icon name="chevron-right" size={13} className="rotate-180" /> All advisories
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {a.cveId && <span className="font-mono text-[14px] font-bold text-red-400">{a.cveId}</span>}
          <SeverityBadge severity={a.severity} />
          {a.cvssScore != null && <span className="font-mono text-[12px] text-[color:var(--text-3)]">CVSS {a.cvssScore.toFixed(1)}</span>}
          {a.technology && (
            <Link href={`/technologies/${a.technology.slug}`} className="no-underline"><Chip tone="brand">{a.technology.name}</Chip></Link>
          )}
          <Chip>{a.status}</Chip>
        </div>
        <h1 className="text-2xl font-bold leading-tight tracking-tight">{a.title}</h1>
        <p className="text-[14.5px] leading-relaxed text-[color:var(--text-2)]">{a.description}</p>
        <Meta>
          <time dateTime={a.publishedAt.toISOString()}>{fmtDateTime(a.publishedAt)}</time>
          {a.source && <span>via {a.source.name}</span>}
        </Meta>
        {session && (
          <div className="flex items-center gap-1.5 border-y border-[color:var(--border)] py-3">
            <SaveButton entityType="ADVISORY" entityId={a.id} label={a.title} />
            {a.technology && <FollowButton entityType="TECHNOLOGY" entityId={a.technology.slug} label={a.technology.name} />}
          </div>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="alert" size={14} className="text-red-400" /> Affected versions</h2>
          {affected.length === 0 && <p className="text-[12.5px] text-[color:var(--text-3)]">Not specified.</p>}
          <ul className="space-y-2">
            {affected.map((v, i) => (
              <li key={i} className="rounded-lg bg-red-500/8 px-3 py-2 ring-1 ring-inset ring-red-400/20">
                <div className="text-[12.5px] font-medium text-[color:var(--text)]">{v.product ?? "Product"}</div>
                {v.versions && <div className="mt-0.5 font-mono text-[11.5px] text-red-400">{v.versions}</div>}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold"><Icon name="check-circle" size={14} className="text-emerald-400" /> Fixed versions</h2>
          {fixed.length === 0 && <p className="text-[12.5px] text-[color:var(--text-3)]">Not yet released.</p>}
          <ul className="space-y-2">
            {fixed.map((v, i) => (
              <li key={i} className="rounded-lg bg-emerald-500/8 px-3 py-2 ring-1 ring-inset ring-emerald-400/20">
                <div className="text-[12.5px] font-medium text-[color:var(--text)]">{v.product ?? "Product"}</div>
                {v.versions && <div className="mt-0.5 font-mono text-[11.5px] text-emerald-400">{v.versions}</div>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {a.recommendation && (
        <Card className="border-l-2 border-l-amber-400 p-5">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold"><Icon name="wand" size={14} className="text-amber-400" /> Recommended action</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--text-2)]">{a.recommendation}</p>
        </Card>
      )}

      {a.advisoryUrl && (
        <div>
          <ExternalLink href={a.advisoryUrl} className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--panel-2)] px-3 py-2 text-[12.5px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]">
            Official advisory <Icon name="external-link" size={13} />
          </ExternalLink>
        </div>
      )}
    </article>
  );
}