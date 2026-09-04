import Link from "next/link";
import type { Metadata } from "next";
import { NewsCardItem } from "@/components/cards";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { queryNews, categoryStats } from "@/lib/data";
import { IMPORTANCE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

const PAGE = 25;
const IMPORTANCE = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ cat?: string; imp?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const cat = sp.cat ?? "all";
  const imp = (sp.imp ?? "all").toUpperCase();
  const q = sp.q ?? "";
  const page = Math.max(0, (parseInt(sp.page ?? "1", 10) || 1) - 1);
  const cats = await categoryStats();
  const items = await queryNews({
    category: cat !== "all" ? cat : undefined,
    importance: imp !== "ALL" && IMPORTANCE.includes(imp as never) ? imp : undefined,
    q: q || undefined,
    primaryOnly: true,
    take: PAGE,
    skip: page * PAGE,
  });
  const hasMore = items.length === PAGE;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">News</h1>
          <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Primary stories across the technology landscape — duplicates are collapsed into source clusters.</p>
        </div>
        <form method="get" action="/news" className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search stories…" className="h-9 w-56 rounded-lg bg-[color:var(--panel-2)] px-3 text-[13px] ring-1 ring-inset ring-[color:var(--border)] outline-none placeholder:text-[color:var(--text-3)] focus:ring-2 focus:ring-cyan-400/50" />
          <button className="h-9 rounded-lg bg-[color:var(--panel-2)] px-3 text-[13px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]" type="submit">Search</button>
        </form>
      </div>

      <div className="panel flex flex-wrap gap-1.5 p-3">
        <FilterChip active={cat === "all"} href={toQuery({ cat: "all", imp, q, page: 0 })}>All</FilterChip>
        {cats.map((c) => (
          <FilterChip key={c.key} active={cat === c.key} href={toQuery({ cat: c.key, imp, q, page: 0 })} color={c.color}>{c.emoji} {c.name}</FilterChip>
        ))}
        <span className="mx-1 my-auto h-4 w-px bg-[color:var(--border)]" />
        {IMPORTANCE.map((f) => (
          <FilterChip key={f} active={imp === f} href={toQuery({ cat, imp: f, q, page: 0 })}>{f === "ALL" ? "All" : IMPORTANCE_LABEL[f as keyof typeof IMPORTANCE_LABEL]}</FilterChip>
        ))}
      </div>

      {items.length === 0 && (
        <EmptyState
          icon={<Icon name="inbox" size={26} />}
          title="No stories match"
          sub="Try a different category or importance level."
          action={<Link href="/news" className="text-[13px] text-cyan-500">Reset filters</Link>}
        />
      )}
      <div className="space-y-3">
        {items.map((n) => <NewsCardItem key={n.id} item={n} />)}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {page > 0 && <PagerLink href={toQuery({ cat, imp, q, page: page - 1 })}>← Previous</PagerLink>}
        {hasMore && <PagerLink href={toQuery({ cat, imp, q, page: page + 1 })}>Next →</PagerLink>}
      </div>
    </div>
  );
}

function toQuery({ cat, imp, q, page }: { cat: string; imp: string; q: string; page: number }) {
  const p = new URLSearchParams();
  if (cat !== "all") p.set("cat", cat);
  if (imp !== "ALL") p.set("imp", imp.toLowerCase());
  if (q) p.set("q", q);
  if (page > 0) p.set("page", String(page + 1));
  const s = p.toString();
  return `/news${s ? `?${s}` : ""}`;
}

function FilterChip({ children, active, href, color }: { children: React.ReactNode; active?: boolean; href: string; color?: string }) {
  return (
    <Link href={href} className={cn(
      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
      active ? "bg-cyan-400/12 text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:text-cyan-300" : "text-[color:var(--text-2)] hover:bg-[color:var(--hover)]",
    )}>
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </Link>
  );
}

function PagerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="rounded-lg bg-[color:var(--panel-2)] px-4 py-2 text-[13px] font-medium ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]">{children}</Link>;
}
