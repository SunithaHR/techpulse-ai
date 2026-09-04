import Link from "next/link";
import type { Metadata } from "next";
import { AdvisoryRow } from "@/components/cards";
import { EmptyState, LinkButton, Stat, buttonCls } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { cn, startOfDayUTC, daysAgo } from "@/lib/utils";
import { SEVERITY_ORDER } from "@/lib/constants";
import { NavSelect } from "@/components/nav-select";

export const metadata: Metadata = { title: "Security" };
export const dynamic = "force-dynamic";

const PAGE = 30;
const RANGES = [
  { v: "7", label: "Last 7 days" },
  { v: "30", label: "Last 30 days" },
  { v: "90", label: "Last 90 days" },
  { v: "all", label: "All time" },
];

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ range?: string; sev?: string; tech?: string; page?: string }> }) {
  const sp = await searchParams;
  const range = sp.range ?? "30";
  const sev = (sp.sev ?? "").toUpperCase();
  const tech = sp.tech ?? "";
  const page = Math.max(0, (parseInt(sp.page ?? "1", 10) || 1) - 1);

  const [techs, stats, items, total] = await Promise.all([
    prisma.technology.findMany({ where: { advisories: { some: {} } }, orderBy: { name: "asc" }, take: 120 }),
    prisma.securityAdvisory.groupBy({ by: ["severity"], _count: true }),
    prisma.securityAdvisory.findMany({
      where: {
        ...(range !== "all" ? { publishedAt: { gte: startOfDayUTC(daysAgo(parseInt(range, 10) - 1)) } } : {}),
        ...(SEVERITY_ORDER.includes(sev as never) ? { severity: sev } : {}),
        ...(tech ? { technology: { slug: tech } } : {}),
      },
      include: { technology: { select: { slug: true, name: true } } },
      orderBy: [{ publishedAt: "desc" }],
      take: PAGE,
      skip: page * PAGE,
    }),
    prisma.securityAdvisory.count({
      where: {
        ...(range !== "all" ? { publishedAt: { gte: startOfDayUTC(daysAgo(parseInt(range, 10) - 1)) } } : {}),
        ...(SEVERITY_ORDER.includes(sev as never) ? { severity: sev } : {}),
        ...(tech ? { technology: { slug: tech } } : {}),
      },
    }),
  ]);
  const hasMore = items.length === PAGE && items.length + page * PAGE < total;
  const sevMap = new Map(stats.map((s) => [s.severity, s._count]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Security</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">CVEs, advisories and vulnerabilities affecting tracked technologies — with affected and fixed versions.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SEVERITY_ORDER.map((s) => (
          <Stat key={s} label={s} value={sevMap.get(s) ?? 0} accent={s === "CRITICAL" ? "#f87171" : s === "HIGH" ? "#fb923c" : s === "MEDIUM" ? "#facc15" : "#94a3b8"} />
        ))}
      </div>

      <div className="panel flex flex-wrap items-center gap-1.5 p-3">
        {RANGES.map((r) => (
          <Link key={r.v} href={q({ range: r.v, sev: sev.toLowerCase(), tech, page: 0 })}
            className={cn(pill, range === r.v && pillOn)}>{r.label}</Link>
        ))}
        <span className="mx-1.5 h-4 w-px bg-[color:var(--border)]" />
        <NavSelect param="sev" value={sev.toLowerCase()} label="Filter by severity" options={[{ value: "", label: "All severities" }, ...SEVERITY_ORDER.map((s) => ({ value: s.toLowerCase(), label: s }))]} />
        <NavSelect param="tech" value={tech} label="Filter by technology" options={[{ value: "", label: "All technologies" }, ...techs.map((t) => ({ value: t.slug, label: t.name }))]} />
        <span className="ml-auto text-[12px] text-[color:var(--text-3)]">{total} advisories</span>
      </div>

      {items.length === 0 && (
        <EmptyState icon={<Icon name="shield" size={26} />} title="No advisories in this window"
          sub="Widen the range or clear the filters."
          action={<LinkButton href="/security?range=all">All time</LinkButton>} />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((a) => <AdvisoryRow key={a.id} a={a} />)}
      </div>

      <div className="flex items-center justify-center gap-3 pt-1">
        {page > 0 && <a className={buttonCls("secondary", "sm")} href={q({ range, sev: sev.toLowerCase(), tech, page: page - 1 })}>← Previous</a>}
        {hasMore && <a className={buttonCls("secondary", "sm")} href={q({ range, sev: sev.toLowerCase(), tech, page: page + 1 })}>Next →</a>}
      </div>
    </div>
  );
}

const pill = "rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]";
const pillOn = "!bg-cyan-400/12 !text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:!text-cyan-300";

function q(p: { range: string; sev: string; tech: string; page: number }) {
  const u = new URLSearchParams();
  u.set("range", p.range);
  if (p.sev) u.set("sev", p.sev);
  if (p.tech) u.set("tech", p.tech);
  if (p.page > 0) u.set("page", String(p.page + 1));
  return `/security?${u.toString()}`;
}