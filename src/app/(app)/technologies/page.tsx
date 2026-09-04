import Link from "next/link";
import type { Metadata } from "next";
import { BrandAvatar, Stars, Chip } from "@/components/ui";
import { Icon } from "@/components/icons";
import { DOMAIN_CATEGORIES, TECH_KIND_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Technologies" };
export const dynamic = "force-dynamic";

type T = Prisma.TechnologyGetPayload<{
  include: {
    category: true; company: { select: { name: true; slug: true } }; _count: { select: { releases: true; newsLinks: true } };
    releases: { orderBy: { announcedOn: "desc" }; take: 1 };
  };
}>;

export default async function TechnologiesPage() {
  const techs = (await prisma.technology.findMany({
    include: {
      category: true,
      company: { select: { name: true, slug: true } },
      releases: { orderBy: { announcedOn: "desc" }, take: 1 },
      _count: { select: { releases: true, newsLinks: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  })) as unknown as T[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Technologies</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Every technology TechPulse tracks — versions, releases, advisories and news.</p>
      </div>

      {DOMAIN_CATEGORIES.map((domain) => {
        const group = techs.filter((t) => t.category?.key === domain.key);
        if (group.length === 0) return null;
        return (
          <section key={domain.key}>
            <h2 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">
              {domain.emoji} {domain.name}
              <span className="rounded bg-[color:var(--panel-2)] px-1.5 py-px text-[10px] font-medium text-[color:var(--text-3)] ring-1 ring-inset ring-[color:var(--border)]">{group.length}</span>
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((t) => {
                const latest = t.releases[0];
                return (
                  <Link key={t.id} href={`/technologies/${t.slug}`} className="panel panel-hover flex items-start gap-3 p-3.5 no-underline">
                    <BrandAvatar name={t.name} accent={t.accent} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13.5px] font-semibold text-[color:var(--text)]">{t.name}</span>
                        {t.company && <span className="truncate text-[11px] text-[color:var(--text-3)]">{t.company.name}</span>}
                      </div>
                      <div className="mt-1 line-clamp-1 text-[11.5px] text-[color:var(--text-3)]">{TECH_KIND_LABEL[t.kind] ?? t.kind}</div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[color:var(--text-3)]">
                        <span className="inline-flex items-center gap-1"><Icon name="package" size={11} /> {t._count.releases} releases</span>
                        {latest && <span className="truncate">latest <span className="font-mono text-cyan-500/90">{latest.version}</span> · {fmtDate(latest.announcedOn)}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
