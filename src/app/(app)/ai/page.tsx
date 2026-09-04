import Link from "next/link";
import type { Metadata } from "next";
import { ModelRowCard, ToolRowCard } from "@/components/cards";
import { SectionHeader, Chip, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { TOOL_CATEGORIES } from "@/lib/constants";
import { fmtDate } from "@/lib/utils";

export const metadata: Metadata = { title: "AI" };
export const dynamic = "force-dynamic";

export default async function AiIndexPage() {
  const [models, tools, latestModel, latestTool, modelCount, toolCount] = await Promise.all([
    prisma.aIModel.findMany({
      where: { isFeatured: true },
      include: { provider: { select: { slug: true, name: true, accent: true } } },
      orderBy: { releasedOn: "desc" },
      take: 6,
    }),
    prisma.aITool.findMany({
      where: { isFeatured: true },
      include: { company: { select: { slug: true, name: true, accent: true } }, primaryCategory: true },
      orderBy: { launchDate: "desc" },
      take: 6,
    }),
    prisma.aIModel.findFirst({ include: { provider: true }, orderBy: { releasedOn: "desc" } }),
    prisma.aITool.findFirst({ include: { company: true, primaryCategory: true }, orderBy: { launchDate: "desc" } }),
    prisma.aIModel.count(),
    prisma.aITool.count(),
  ]);

  const catCounts = await prisma.aITool.groupBy({ by: ["primaryCategoryId"], _count: true });
  const byCat = new Map(catCounts.map((c) => [c.primaryCategoryId, c._count]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">AI</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">
          Models, tools, agents and announcements — {modelCount} models · {toolCount} tools tracked.
        </p>
      </div>

      {/* Hero cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="panel relative overflow-hidden p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/15 blur-2xl" />
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-violet-400"><Icon name="brain" size={14} /> AI Models</div>
          {latestModel && (
            <>
              <div className="mt-3 text-[17px] font-bold tracking-tight">
                <Link href={`/ai/models/${latestModel.slug}`} className="hover:text-cyan-400">{latestModel.name}</Link>
              </div>
              <p className="mt-1 line-clamp-2 text-[12.5px] text-[color:var(--text-2)]">{latestModel.description}</p>
              <div className="mt-2 text-[11.5px] text-[color:var(--text-3)]">
                {latestModel.provider.name} · {latestModel.releasedOn ? fmtDate(latestModel.releasedOn) : "upcoming"}
                {latestModel.contextWindow ? ` · ${(latestModel.contextWindow / 1000).toFixed(0)}K context` : ""}
              </div>
            </>
          )}
          <div className="mt-4"><LinkButton href="/ai/models" variant="outline" size="sm"><Icon name="scale" size={13} /> Compare models</LinkButton></div>
        </div>
        <div className="panel relative overflow-hidden p-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-500/15 blur-2xl" />
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-cyan-400"><Icon name="wand" size={14} /> AI Tools</div>
          {latestTool && (
            <>
              <div className="mt-3 text-[17px] font-bold tracking-tight">
                <Link href={`/ai/tools/${latestTool.slug}`} className="hover:text-cyan-400">{latestTool.name}</Link>
              </div>
              <p className="mt-1 line-clamp-2 text-[12.5px] text-[color:var(--text-2)]">{latestTool.description}</p>
              <div className="mt-2 text-[11.5px] text-[color:var(--text-3)]">
                {latestTool.company?.name ?? latestTool.primaryCategory?.name} · {latestTool.launchDate ? fmtDate(latestTool.launchDate) : "recently"}
              </div>
            </>
          )}
          <div className="mt-4"><LinkButton href="/ai/tools" variant="outline" size="sm">Browse all tools</LinkButton></div>
        </div>
      </div>

      {/* Tool categories */}
      <section>
        <SectionHeader title="Tool categories" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {TOOL_CATEGORIES.map((c) => (
            <Link key={c.key} href={`/ai/tools?cat=${c.key}`} className="panel panel-hover flex items-center gap-2 px-3 py-3 no-underline">
              <span className="text-[16px]">{c.emoji}</span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-[color:var(--text)]">{c.name}</div>
                <div className="text-[10.5px] text-[color:var(--text-3)]">{byCat.get(c.key) ?? 0} tools</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Latest featured models" right={<Link href="/ai/models" className="text-[12px] text-cyan-500 hover:underline">All models →</Link>} />
        <div className="grid gap-3 lg:grid-cols-2">
          {models.map((m) => <ModelRowCard key={m.id} m={m} />)}
        </div>
      </section>

      <section>
        <SectionHeader title="Latest featured tools" right={<Link href="/ai/tools" className="text-[12px] text-cyan-500 hover:underline">All tools →</Link>} />
        <div className="grid gap-3 lg:grid-cols-2">
          {tools.map((t) => <ToolRowCard key={t.id} t={t} />)}
        </div>
      </section>

      <div className="panel flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-400/10 text-violet-400"><Icon name="bot" size={20} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold">Compare models side by side</div>
          <div className="text-[12.5px] text-[color:var(--text-2)]">Context, pricing, reasoning, open-weight status and capabilities — pick any models to compare.</div>
        </div>
        <LinkButton href="/compare?kind=MODELS"><Icon name="scale" size={14} /> Open compare</LinkButton>
      </div>
    </div>
  );
}