import Link from "next/link";
import type { Metadata } from "next";
import { NewsCardItem } from "@/components/cards";
import { EmptyState, Input, LinkButton, buttonCls } from "@/components/ui";
import { Icon } from "@/components/icons";
import { queryNews, categoryStats, type NewsCard } from "@/lib/data";
import { groupByDay } from "@/lib/data";
import { startOfDayUTC, cn, fmtDate } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Timeline" };
export const dynamic = "force-dynamic";

const PRESETS = [
  { key: "today", label: "Today", days: 1 },
  { key: "yesterday", label: "Yesterday", days: 2, offset: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "month", label: "This month", days: 31, month: true },
  { key: "prev-month", label: "Previous month", month: true, prev: true },
  { key: "custom", label: "Custom", custom: true },
];

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; cat?: string; imp?: string }> }) {
  const sp = await searchParams;
  const cats = await categoryStats();
  const now = new Date();
  const today = startOfDayUTC(now);

  const customFrom = sp.from ? new Date(`${sp.from}T00:00:00`) : null;
  const customTo = sp.to ? new Date(`${sp.to}T23:59:59`) : null;
  const mode = (customFrom && customTo) || detectPreset(sp) === "custom" ? "custom" : detectPreset(sp);
  const preset = PRESETS.find((p) => p.key === mode) ?? PRESETS[2];

  let from: Date;
  let to: Date;
  if (customFrom && customTo) {
    from = customFrom;
    to = customTo;
  } else if (preset.key === "yesterday") {
    from = new Date(today);
    from.setDate(from.getDate() - 1);
    to = new Date(from);
    to.setHours(23, 59, 59, 999);
  } else if (preset.key === "today") {
    from = today;
    to = new Date(now);
  } else if (preset.month && preset.prev) {
    to = new Date(today);
    to.setDate(0);
    to.setHours(23, 59, 59, 999);
    from = new Date(to);
    from.setDate(1);
  } else if (preset.month) {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
    to = new Date(now);
  } else {
    const days = preset.days ?? 7;
    from = new Date(today);
    from.setDate(from.getDate() - (days - 1));
    to = new Date(now);
  }

  const cat = sp.cat ?? "all";
  const imp = sp.imp ?? "all";
  const items = await queryNews({
    from,
    to,
    category: cat !== "all" ? cat : undefined,
    importance: imp !== "all" ? imp.toUpperCase() : undefined,
    primaryOnly: true,
    take: 500,
    orderBy: [{ publishedAt: "desc" }],
  });
  const groups = groupByDay(items);

  const h = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Technology timeline</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Everything important, organized by the day it happened.</p>
      </div>

      {/* Preset bar */}
      <div className="panel p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => {
            if (p.custom) {
              return null;
            }
            const active = mode === p.key && !(customFrom && customTo);
            return (
              <Link
                key={p.key}
                href={`/timeline?${qs({ cat, imp, mode: p.key })}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  active ? "bg-cyan-400/12 text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:text-cyan-300" : "text-[color:var(--text-2)] hover:bg-[color:var(--hover)]",
                )}
              >
                {p.label}
              </Link>
            );
          })}
          <form className="ml-auto flex flex-wrap items-center gap-2" action="/timeline" method="get">
            <label className="text-[11.5px] text-[color:var(--text-3)]">From</label>
            <input type="date" name="from" defaultValue={customFrom ? h(customFrom) : h(new Date(today.getTime() - 6 * 86_400_000))} className={inputClsMini()} />
            <label className="text-[11.5px] text-[color:var(--text-3)]">To</label>
            <input type="date" name="to" defaultValue={customTo ? h(customTo) : h(now)} className={inputClsMini()} />
            <input type="hidden" name="cat" value={cat} />
            <input type="hidden" name="imp" value={imp} />
            <button className={buttonCls("secondary", "sm")} type="submit">Apply range</button>
          </form>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-[color:var(--border)] pt-2.5">
          <Link href={`/timeline?${qs({ from: h(from), to: h(to), cat: "all", imp, mode })}`} className={cn(chipCls(), cat === "all" && chipActive())}>All</Link>
          {cats.slice(0, 16).map((c) => (
            <Link key={c.key} href={`/timeline?${qs({ from: h(from), to: h(to), cat: c.key, imp, mode })}`} className={cn(chipCls(), cat === c.key && chipActive())}>
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[12.5px] text-[color:var(--text-3)]">
        Showing <span className="font-semibold text-[color:var(--text)]">{items.length}</span> primary stories from{" "}
        <span className="font-semibold text-[color:var(--text)]">{fmtDate(from)}</span> → <span className="font-semibold text-[color:var(--text)]">{fmtDate(to)}</span>
      </p>

      {groups.length === 0 && (
        <EmptyState
          icon={<Icon name="calendar-range" size={26} />}
          title="No stories in this range"
          sub="Pick a wider date range or drop the category filter."
          action={<LinkButton href="/timeline">Reset</LinkButton>}
        />
      )}

      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g.day}>
            <h2 className="sticky top-16 z-10 -mx-1 mb-4 flex items-center gap-3 rounded-lg bg-[color:var(--bg)]/90 px-1 py-1.5 backdrop-blur">
              <span className="flex h-8 items-center gap-2 rounded-lg bg-[color:var(--panel)] px-3 text-[13px] font-semibold ring-1 ring-inset ring-[color:var(--border)]">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" />
                {g.label === "Today" || g.label === "Yesterday" ? g.label : fmtDate(g.date)}
              </span>
              <span className="text-[11.5px] text-[color:var(--text-3)]">{g.items.length} updates</span>
            </h2>
            <div className="grid gap-3 xl:grid-cols-2">
              {g.items.map((n) => <NewsCardItem key={n.id} item={n} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function detectPreset(sp: { cat?: string; imp?: string; mode?: string }): string {
  return sp.mode ?? "7d";
}

function chipCls() {
  return "inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]";
}
function chipActive() {
  return "!bg-cyan-400/12 !text-cyan-600 dark:!text-cyan-300 ring-1 ring-inset ring-cyan-400/35";
}
function inputClsMini() {
  return "h-8 rounded-lg bg-[color:var(--panel-2)] px-2 text-[12px] text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] outline-none [color-scheme:light] dark:[color-scheme:dark]";
}
function qs(params: Record<string, string>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  return p.toString();
}
