import Link from "next/link";
import type { Metadata } from "next";
import { ModelRowCard } from "@/components/cards";
import { EmptyState, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { fmtDate, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "AI Models" };
export const dynamic = "force-dynamic";

const PAGE = 36;
const FAMILIES = ["All families", "OpenAI GPT", "Claude", "Gemini", "Llama", "Mistral", "DeepSeek", "Qwen", "Grok", "Phi", "Command"];

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ q?: string; family?: string; company?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const family = sp.family ?? "All families";
  const company = sp.company ?? "";
  const page = Math.max(0, (parseInt(sp.page ?? "1", 10) || 1) - 1);

  const models = await prisma.aIModel.findMany({
    where: {
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { family: { contains: q, mode: "insensitive" } }] } : {}),
      ...(family !== "All families" ? { family: { contains: family.replace("OpenAI ", "").replace("Claude", "claude"), mode: "insensitive" } } : {}),
      ...(company ? { provider: { slug: company } } : {}),
    },
    include: { provider: { select: { slug: true, name: true, accent: true } } },
    orderBy: [{ isFeatured: "desc" }, { releasedOn: "desc" }],
    take: PAGE,
    skip: page * PAGE,
  });
  const hasMore = models.length === PAGE;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI Models</h1>
          <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Frontier and open-weight models with context, pricing and capability specs.</p>
        </div>
        <LinkButton href="/compare?kind=MODELS" variant="outline" size="sm"><Icon name="scale" size={13} /> Compare models</LinkButton>
      </div>

      <div className="panel flex flex-wrap items-center gap-1.5 p-3">
        {FAMILIES.map((f) => (
          <Link key={f} href={q ? `/ai/models?q=${encodeURIComponent(q)}&family=${encodeURIComponent(f)}` : `/ai/models?family=${encodeURIComponent(f)}`}
            className={cn("rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]", family === f && "!bg-cyan-400/12 !text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:!text-cyan-300")}>
            {f}
          </Link>
        ))}
      </div>

      {models.length === 0 && (
        <EmptyState icon={<Icon name="brain" size={26} />} title="No models match"
          sub="Try a different family or search term."
          action={<LinkButton href="/ai/models">Clear filters</LinkButton>} />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {models.map((m) => <ModelRowCard key={m.id} m={m} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-1">
          <Link className="rounded-lg bg-[color:var(--panel-2)] px-4 py-2 text-[12.5px] font-medium text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]"
            href={`/ai/models?q=${encodeURIComponent(q)}&family=${encodeURIComponent(family)}&company=${encodeURIComponent(company)}&page=${page + 2}`}>
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}