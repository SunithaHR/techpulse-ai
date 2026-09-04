import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BrandAvatar, Chip, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { cn, fmtDate, formatPricePerM, asArray, asObject, asBool } from "@/lib/utils";
import { ComparePicker, type CompareOption } from "./compare-picker";

export const metadata: Metadata = { title: "Compare" };
export const dynamic = "force-dynamic";

const KINDS = [
  { key: "MODELS", label: "AI Models", icon: "brain" },
  { key: "TECHNOLOGIES", label: "Technologies", icon: "boxes" },
  { key: "AI_TOOLS", label: "AI Tools", icon: "wand" },
  { key: "COMPANIES", label: "Companies", icon: "building-2" },
] as const;

type Kind = (typeof KINDS)[number]["key"];

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ kind?: string; ids?: string }> }) {
  const sp = await searchParams;
  const kind = (KINDS.some((k) => k.key === sp.kind) ? sp.kind! : "MODELS") as Kind;
  const ids = (sp.ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const { entities, options, raw } = await load(kind, ids);
  if (entities.length === 0 && options.length === 0) notFound();

  const specRows = buildRows(kind, raw);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Compare</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Side-by-side specs from the TechPulse knowledge base.</p>
      </div>

      <div className="panel flex flex-wrap items-center gap-1.5 p-3">
        {KINDS.map((k) => (
          <Link key={k.key} href={`/compare?kind=${k.key}`}
            className={cn("rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]", kind === k.key && "!bg-cyan-400/12 !text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:!text-cyan-300")}>
            <Icon name={k.icon} size={12} className="mr-1 inline" /> {k.label}
          </Link>
        ))}
      </div>

      <ComparePicker kind={kind} options={options} selected={entities.map((e) => e.slug)} />

      {entities.length === 0 && (
        <EmptyState icon={<Icon name="scale" size={26} />} title="Pick items to compare" sub="Select two or more items above — or from the list below — to build the comparison table." />
      )}

      {entities.length >= 2 && (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[color:var(--border)]">
                <th className="w-40 p-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">Spec</th>
                {entities.map((e) => (
                  <th key={e.slug} className="p-3 text-left">
                    <div className="flex items-center gap-2">
                      <BrandAvatar name={e.name} accent={e.accent} size={28} />
                      <Link href={e.href} className="text-[13.5px] font-semibold text-[color:var(--text)] hover:text-cyan-500">{e.name}</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((row) => (
                <tr key={row.label} className="border-b border-[color:var(--border)] last:border-0 hover:bg-[color:var(--hover)]/40">
                  <td className="p-3 text-[11.5px] font-semibold uppercase tracking-wide text-[color:var(--text-3)]">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={cn("p-3 align-top text-[color:var(--text-2)]", v.highlight && "font-semibold text-cyan-500")}>{v.node}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entities.length === 1 && (
        <p className="text-center text-[12.5px] text-[color:var(--text-3)]">Add at least one more item to see the comparison table.</p>
      )}
    </div>
  );
}

interface RowValue {
  node: React.ReactNode;
  highlight?: boolean;
}

interface Loaded {
  entities: { slug: string; name: string; accent?: string | null; href: string }[];
  options: CompareOption[];
  raw: any[];
}

async function load(kind: Kind, ids: string[]): Promise<Loaded> {
  const n = (v: string) => (v.includes("/") ? v.split("/")[1] : v);
  switch (kind) {
    case "MODELS": {
      const [all, selected] = await Promise.all([
        prisma.aIModel.findMany({ include: { provider: { select: { slug: true, name: true, accent: true } } }, orderBy: { releasedOn: "desc" }, take: 40 }),
        ids.length ? prisma.aIModel.findMany({ where: { slug: { in: ids } }, include: { provider: { select: { slug: true, name: true, accent: true } } } }) : Promise.resolve([]),
      ]);
      const entities = selected.length ? selected : all.slice(0, 3);
      return {
        entities: entities.map((m) => ({ slug: m.slug, name: m.name, accent: m.provider?.accent, href: `/ai/models/${m.slug}` })),
        options: all.map<CompareOption>((m) => ({ slug: m.slug, name: m.name, accent: m.provider?.accent, sub: m.provider?.name })),
        raw: entities,
      };
    }
    case "TECHNOLOGIES": {
      const [all, selected] = await Promise.all([
        prisma.technology.findMany({ include: { releases: { orderBy: { announcedOn: "desc" }, take: 1 } }, orderBy: { isFeatured: "desc" }, take: 60 }),
        ids.length ? prisma.technology.findMany({ where: { slug: { in: ids } }, include: { releases: { orderBy: { announcedOn: "desc" }, take: 1 } } }) : Promise.resolve([]),
      ]);
      const entities = selected.length ? selected : all.slice(0, 3);
      return {
        entities: entities.map((t) => ({ slug: t.slug, name: t.name, accent: t.accent, href: `/technologies/${t.slug}` })),
        options: all.map<CompareOption>((t) => ({ slug: t.slug, name: t.name, accent: t.accent, sub: t.kind })),
        raw: entities,
      };
    }
    case "AI_TOOLS": {
      const [all, selected] = await Promise.all([
        prisma.aITool.findMany({ include: { company: true, primaryCategory: true }, orderBy: { launchDate: "desc" }, take: 60 }),
        ids.length ? prisma.aITool.findMany({ where: { slug: { in: ids } }, include: { company: true, primaryCategory: true } }) : Promise.resolve([]),
      ]);
      const entities = selected.length ? selected : all.slice(0, 3);
      return {
        entities: entities.map((t) => ({ slug: t.slug, name: t.name, accent: t.company?.accent ?? t.primaryCategory?.color, href: `/ai/tools/${t.slug}` })),
        options: all.map<CompareOption>((t) => ({ slug: t.slug, name: t.name, accent: t.company?.accent ?? t.primaryCategory?.color, sub: t.company?.name ?? t.primaryCategory?.name })),
        raw: entities,
      };
    }
    case "COMPANIES": {
      const [all, selected] = await Promise.all([
        prisma.company.findMany({ include: { _count: { select: { aiModels: true, aiTools: true, releases: true, technologies: true } } }, orderBy: { isFeatured: "desc" }, take: 50 }),
        ids.length ? prisma.company.findMany({ where: { slug: { in: ids } }, include: { _count: { select: { aiModels: true, aiTools: true, releases: true, technologies: true } } } }) : Promise.resolve([]),
      ]);
      const entities = selected.length ? selected : all.slice(0, 3);
      return {
        entities: entities.map((c) => ({ slug: c.slug, name: c.name, accent: c.accent, href: `/companies/${c.slug}` })),
        options: all.map<CompareOption>((c) => ({ slug: c.slug, name: c.name, accent: c.accent, sub: c.headquarters ?? undefined })),
        raw: entities,
      };
    }
  }
}

type RowSpec = { label: string; values: RowValue[] };

function buildRows(kind: Kind, entities: any[]): RowSpec[] {
  if (entities.length === 0) return [];
  const rows: RowSpec[] = [];
  const add = (label: string, fn: (e: (typeof entities)[number]) => RowValue) => {
    rows.push({ label, values: entities.map(fn) });
  };

  const H = (v: React.ReactNode): RowValue => ({ node: v, highlight: true });

  switch (kind) {
    case "MODELS": {
      add("Provider", (m: any) => ({ node: m.provider?.name ?? "—" }));
      add("Released", (m: any) => ({ node: m.releasedOn ? fmtDate(m.releasedOn) : "—" }));
      add("Context window", (m: any) => H(m.contextWindow ? `${(m.contextWindow / 1000).toFixed(0)}K` : "—"));
      add("Max output", (m: any) => ({ node: m.maxOutput ? `${(m.maxOutput / 1000).toFixed(0)}K` : "—" }));
      add("Reasoning", (m: any) => ({ node: asBool(m.capabilities?.reasoning) ? "✓" : "—" }));
      add("Tool calling", (m: any) => ({ node: asBool(m.capabilities?.toolCalling) ? "✓" : "—" }));
      add("Vision", (m: any) => ({ node: asBool(m.capabilities?.vision) ? "✓" : "—" }));
      add("Structured output", (m: any) => ({ node: asBool(m.capabilities?.structuredOutput) ? "✓" : "—" }));
      add("Open weights", (m: any) => ({ node: m.openSource ? "✓" : "—" }));
      add("API", (m: any) => ({ node: m.apiAvailable ? "✓" : "—" }));
      add("Input price /1M", (m: any) => ({ node: formatPricePerM(asObject<{ inputPerM?: number }>(m.pricing).inputPerM) }));
      add("Output price /1M", (m: any) => ({ node: formatPricePerM(asObject<{ outputPerM?: number }>(m.pricing).outputPerM) }));
      break;
    }
    case "TECHNOLOGIES": {
      add("Kind", (t: any) => ({ node: t.kind.toLowerCase() }));
      add("License", (t: any) => ({ node: t.license ?? "—" }));
      add("Stars", (t: any) => ({ node: t.stars ? `★ ${t.stars.toLocaleString()}` : "—" }));
      add("Latest version", (t: any) => H(t.releases?.[0] ? t.releases[0].version : "—"));
      add("Latest release", (t: any) => ({ node: t.releases?.[0] ? fmtDate(t.releases[0].announcedOn) : "—" }));
      add("Open source", (t: any) => ({ node: t.githubUrl ? "✓" : "—" }));
      add("Docs", (t: any) => ({ node: t.docsUrl ? "✓" : "—" }));
      break;
    }
    case "AI_TOOLS": {
      add("Company", (t: any) => ({ node: t.company?.name ?? "—" }));
      add("Category", (t: any) => ({ node: t.primaryCategory?.name ?? "—" }));
      add("Pricing", (t: any) => ({ node: (t.pricingModel ?? "").toLowerCase().replace(/_/g, " ") }));
      add("Launched", (t: any) => ({ node: t.launchDate ? fmtDate(t.launchDate) : "—" }));
      add("API", (t: any) => ({ node: t.apiAvailable ? "✓" : "—" }));
      add("Open source", (t: any) => ({ node: t.pricingModel === "OPEN_SOURCE" ? "✓" : "—" }));
      add("Features", (t: any) => ({ node: asArray<string>(t.features).length }));
      break;
    }
    case "COMPANIES": {
      add("Founded", (c: any) => ({ node: c.founded ?? "—" }));
      add("Headquarters", (c: any) => ({ node: c.headquarters ?? "—" }));
      add("AI models", (c: any) => ({ node: c._count.aiModels }));
      add("AI tools", (c: any) => ({ node: c._count.aiTools }));
      add("Releases", (c: any) => ({ node: c._count.releases }));
      add("Technologies", (c: any) => ({ node: c._count.technologies }));
      add("Open source", (c: any) => ({ node: c.githubOrg ? "✓" : "—" }));
      const d = asObject<Record<string, string>>(entities[0].details);
      if (d.stock) add("Stock", (c: any) => ({ node: asObject<Record<string, string>>(c.details).stock ?? "—" }));
      if (d.ceo) add("CEO", (c: any) => ({ node: asObject<Record<string, string>>(c.details).ceo ?? "—" }));
      break;
    }
  }
  return rows;
}