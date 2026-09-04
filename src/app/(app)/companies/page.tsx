import Link from "next/link";
import type { Metadata } from "next";
import { BrandAvatar, Chip } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "Companies" };
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { aiModels: true, aiTools: true, releases: true, technologies: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Companies</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">
          Announcements, products, models and developer updates from the companies that move technology.
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <Link key={c.id} href={`/companies/${c.slug}`} className="panel panel-hover flex items-start gap-3 p-4 no-underline">
            <BrandAvatar name={c.name} accent={c.accent} size={38} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] font-semibold text-[color:var(--text)]">{c.name}</span>
                {c.isFeatured && <Chip tone="brand">Featured</Chip>}
              </div>
              <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[color:var(--text-3)]">{c.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[color:var(--text-3)]">
                <span className="inline-flex items-center gap-1"><Icon name="brain" size={11} /> {c._count.aiModels} models</span>
                <span className="inline-flex items-center gap-1"><Icon name="wand" size={11} /> {c._count.aiTools} tools</span>
                <span className="inline-flex items-center gap-1"><Icon name="package" size={11} /> {c._count.releases} releases</span>
                <span className="inline-flex items-center gap-1"><Icon name="boxes" size={11} /> {c._count.technologies} techs</span>
                {c.founded && <span>founded {c.founded}</span>}
              </div>
              {c.githubOrg && <div className="mt-1 truncate font-mono text-[10.5px] text-[color:var(--text-3)]">{c.githubOrg}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}