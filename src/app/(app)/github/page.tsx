import Link from "next/link";
import type { Metadata } from "next";
import { RepoRowCard } from "@/components/cards";
import { EmptyState, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { NavSelect } from "@/components/nav-select";

export const metadata: Metadata = { title: "GitHub" };
export const dynamic = "force-dynamic";

const PAGE = 40;
const LANG_FILTERS = ["All", "TypeScript", "Python", "Rust", "Go", "JavaScript", "C", "C++", "Java", "Kotlin", "Ruby", "Shell", "Vue", "Swift"];

export default async function GithubPage({ searchParams }: { searchParams: Promise<{ q?: string; lang?: string; sort?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const lang = sp.lang ?? "All";
  const sort = sp.sort ?? "stars";
  const page = Math.max(0, (parseInt(sp.page ?? "1", 10) || 1) - 1);

  const repos = await prisma.repository.findMany({
    where: {
      ...(q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {}),
      ...(lang !== "All" ? { language: lang } : {}),
    },
    orderBy: sort === "updated" ? { lastSyncedAt: "desc" } : { stars: "desc" },
    take: PAGE,
    skip: page * PAGE,
  });
  const hasMore = repos.length === PAGE;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">GitHub</h1>
        <p className="mt-1 text-[13px] text-[color:var(--text-2)]">Important open-source repositories with release and activity signals.</p>
      </div>

      <div className="panel flex flex-wrap items-center gap-1.5 p-3">
        {LANG_FILTERS.map((l) => (
          <Link key={l} href={q ? `/github?q=${encodeURIComponent(q)}&lang=${encodeURIComponent(l)}&sort=${sort}` : `/github?lang=${encodeURIComponent(l)}&sort=${sort}`}
            className={cn(pill, lang === l && pillOn)}>{l}</Link>
        ))}
        <span className="mx-1.5 h-4 w-px bg-[color:var(--border)]" />
        <NavSelect param="sort" value={sort} label="Sort" options={[{ value: "stars", label: "Most stars" }, { value: "updated", label: "Recently synced" }]} />
        <span className="ml-auto text-[12px] text-[color:var(--text-3)]">{repos.length} repos</span>
      </div>

      {repos.length === 0 && (
        <EmptyState icon={<Icon name="git-branch" size={26} />} title="No repositories found"
          sub="Try a different language filter or search term."
          action={<LinkButton href="/github">Clear filters</LinkButton>} />
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {repos.map((r) => <RepoRowCard key={r.id} r={r} />)}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-1">
          <Link className="rounded-lg bg-[color:var(--panel-2)] px-4 py-2 text-[12.5px] font-medium text-[color:var(--text)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]"
            href={`/github?q=${encodeURIComponent(q)}&lang=${encodeURIComponent(lang)}&sort=${sort}&page=${page + 2}`}>
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}

const pill = "rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] hover:bg-[color:var(--hover)]";
const pillOn = "!bg-cyan-400/12 !text-cyan-600 ring-1 ring-inset ring-cyan-400/35 dark:!text-cyan-300";