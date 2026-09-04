import Link from "next/link";
import type { Metadata } from "next";
import { ToolRowCard } from "@/components/cards";
import { EmptyState, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { TOOL_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "AI Tools" };
export const dynamic = "force-dynamic";

const PAGE = 36;

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const cat = sp.cat ?? "";
  const page = Math.max(0, (parseInt(sp.page ?? "1", 10) || 1) - 1);

  const tools = await prisma.aITool.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { tags: { array_contains: [q] } }] } : {}),
      ...(cat ? { primaryCategory: { key: cat } } : {}),
    },
    include: { company: { select: { slug: true, name: true, accent: true } }, primaryCategory: true },
    orderBy: [{ isFeatured: "desc" }, { launchDate: "desc" }],
    take: PAGE,
    skip: page * PAGE,
  });
  const hasMore = tools.length === PAGE;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">AI Tools</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Coding assistants, agents, infrastructure, media generation and everything in between.</p>
      </div>

      <div className="panel flex flex-wrap items-center gap-1.5 p-3">
        <Link href="/ai/tools" className={cn(pill, !cat && pillOn)}>All</Link>
        {TOOL_CATEGORIES.map((c) => (
          <Link key={c.key} href={`/ai/tools?cat=${c.key}`} className={cn(pill, cat === c.key && pillOn)}>
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      {tools.length === 0 && (
        <EmptyState icon={<Icon name="wand" size={26} />} title="No tools in this category"
          sub="Try another category or clear the filter."
          action={<LinkButton href="/ai/tools">Clear filters</LinkButton>} />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {tools.map((t) => <ToolRowCard key={t.id} t={t} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-1">
          <Link className="rounded-lg bg-[color:var(--panel-2)] px-4 py-2 text-[12.5px] font-medium text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]"
            href={`/ai/tools?q=${encodeURIComponent(q)}&cat=${encodeURIComponent(cat)}&page=${page + 2}`}>
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}

const pill = "rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]";
const pillOn = "!bg-cyan-400/12 !text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:!text-cyan-300";