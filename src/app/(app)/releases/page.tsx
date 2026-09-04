import Link from "next/link";
import type { Metadata } from "next";
import { ReleaseCard } from "@/components/cards";
import { EmptyState, Select, LinkButton, buttonCls } from "@/components/ui";
import { Icon } from "@/components/icons";
import { queryReleases } from "@/lib/data";
import { IMPORTANCE_LABEL, RELEASE_KIND_LABEL } from "@/lib/constants";
import { cn, fmtDate, startOfDayUTC, daysAgo } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { NavSelect } from "@/components/nav-select";

export const metadata: Metadata = { title: "Releases" };
export const dynamic = "force-dynamic";

const PAGE = 30;
const RANGES = [
  { v: "1", label: "Today" },
  { v: "7", label: "Last 7 days" },
  { v: "30", label: "Last 30 days" },
  { v: "90", label: "Last 90 days" },
];

export default async function ReleasesPage({ searchParams }: { searchParams: Promise<{ range?: string; tech?: string; imp?: string; page?: string }> }) {
  const sp = await searchParams;
  const rangeDays = ["1", "7", "30", "90"].includes(sp.range ?? "") ? parseInt(sp.range!, 10) : 7;
  const tech = sp.tech ?? "all";
  const imp = (sp.imp ?? "all").toUpperCase();
  const page = Math.max(0, (parseInt(sp.page ?? "1", 10) || 1) - 1);

  const techs = await prisma.technology.findMany({ where: { releases: { some: {} } }, orderBy: { name: "asc" }, take: 200 });
  const items = await queryReleases({
    from: startOfDayUTC(daysAgo(rangeDays - 1)),
    techSlug: tech !== "all" ? tech : undefined,
    importance: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(imp) ? imp : undefined,
    take: PAGE,
    skip: page * PAGE,
  });
  const hasMore = items.length === PAGE;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Releases</h1>
          <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Versioned releases across languages, frameworks, databases, tooling and platforms.</p>
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-1.5 p-3">
        {RANGES.map((r) => (
          <Link key={r.v} href={q({ range: r.v, tech, imp: imp.toLowerCase(), page: 0 })}
            className={cn(pill, String(rangeDays) === r.v && pillOn)}>{r.label}</Link>
        ))}
        <span className="mx-1.5 h-4 w-px bg-[color:var(--border)]" />
        <NavSelect
          param="tech"
          value={tech}
          clearValue="all"
          label="Filter by technology"
          options={[{ value: "all", label: "All technologies" }, ...techs.map((t) => ({ value: t.slug, label: t.name }))]}
        />
        <NavSelect
          param="imp"
          value={imp.toLowerCase()}
          clearValue="all"
          label="Filter by importance"
          options={[{ value: "all", label: "All importance" }, ...Object.entries(IMPORTANCE_LABEL).map(([k, v]) => ({ value: k.toLowerCase(), label: v }))]}
        />
        <span className="ml-auto text-[12px] text-[color:var(--text-3)]">{items.length} releases</span>
      </div>

      {items.length === 0 && (
        <EmptyState icon={<Icon name="package" size={26} />} title="No releases in this window"
          sub="Try widening the date range."
          action={<LinkButton href="/releases?range=30">Last 30 days</LinkButton>} />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((r) => <ReleaseCard key={r.id} item={r} />)}
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        {page > 0 && <a className={buttonCls("secondary", "sm")} href={q({ range: String(rangeDays), tech, imp: imp.toLowerCase(), page: page - 1 })}>← Previous</a>}
        {hasMore && <a className={buttonCls("secondary", "sm")} href={q({ range: String(rangeDays), tech, imp: imp.toLowerCase(), page: page + 1 })}>Next →</a>}
      </div>
    </div>
  );
}

const pill = "rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]";
const pillOn = "!bg-cyan-400/12 !text-cyan-600 dark:!text-cyan-300 ring-1 ring-inset ring-cyan-400/35";
function q(p: { range: string; tech: string; imp: string; page: number }) {
  const u = new URLSearchParams();
  u.set("range", p.range);
  if (p.tech !== "all") u.set("tech", p.tech);
  if (p.imp !== "all") u.set("imp", p.imp);
  if (p.page > 0) u.set("page", String(p.page + 1));
  return `/releases?${u.toString()}`;
}
