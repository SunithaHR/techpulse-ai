import Link from "next/link";
import type { Metadata } from "next";
import { NewsCardSlim } from "@/components/cards";
import { BrandAvatar, Chip, EmptyState, SectionHeader } from "@/components/ui";
import { Icon } from "@/components/icons";
import { prisma } from "@/lib/db";
import { formatCount } from "@/lib/utils";
import { IMPORTANCE_META } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  if (!q) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-semibold tracking-tight">Search</h1>
        <div className="panel flex items-center gap-3 p-4">
          <Icon name="search" size={18} className="text-[color:var(--text-3)]" />
          <form action="/search" className="flex-1">
            <input name="q" autoFocus placeholder="Search news, releases, models, tools, companies, repos…" className="h-10 w-full bg-transparent text-[14px] outline-none placeholder:text-[color:var(--text-3)]" />
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          {["React", "OpenAI", "Claude", "PostgreSQL", "Docker", "Next.js", "AI agents", "Node.js", "Kubernetes", "Gemini"].map((t) => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-lg bg-[color:var(--panel-2)] px-2.5 py-1.5 text-[12px] font-medium text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)] hover:bg-[color:var(--hover)]">{t}</Link>
          ))}
        </div>
      </div>
    );
  }

  const like = { contains: q, mode: "insensitive" as const };

  const [news, releases, techs, companies, models, tools, repos, advisories] = await Promise.all([
    prisma.news.findMany({
      where: {
        isPrimary: true,
        OR: [{ title: like }, { summary: like }, { tags: { array_contains: [q] } }],
      },
      include: {
        category: true, source: true,
        technologies: { take: 2, include: { technology: { select: { id: true, slug: true, name: true, accent: true, kind: true } } } },
        companies: { take: 2, include: { company: { select: { id: true, slug: true, name: true, accent: true } } } },
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    prisma.release.findMany({
      where: { OR: [{ version: like }, { summary: like }, { technology: { name: like } }] },
      include: { technology: { select: { slug: true, name: true, accent: true } }, company: { select: { slug: true, name: true } } },
      orderBy: { announcedOn: "desc" },
      take: 8,
    }),
    prisma.technology.findMany({ where: { OR: [{ name: like }, { description: like }] }, orderBy: { isFeatured: "desc" }, take: 8 }),
    prisma.company.findMany({ where: { OR: [{ name: like }, { description: like }] }, orderBy: { isFeatured: "desc" }, take: 8 }),
    prisma.aIModel.findMany({ where: { OR: [{ name: like }, { description: like }, { family: like }] }, include: { provider: { select: { slug: true, name: true, accent: true } } }, orderBy: { releasedOn: "desc" }, take: 8 }),
    prisma.aITool.findMany({ where: { OR: [{ name: like }, { description: like }] }, include: { company: { select: { slug: true, name: true, accent: true } }, primaryCategory: true }, orderBy: { launchDate: "desc" }, take: 8 }),
    prisma.repository.findMany({ where: { OR: [{ fullName: like }, { description: like }] }, orderBy: { stars: "desc" }, take: 8 }),
    prisma.securityAdvisory.findMany({ where: { OR: [{ title: like }, { cveId: like }, { description: like }] }, include: { technology: { select: { slug: true, name: true } } }, orderBy: { publishedAt: "desc" }, take: 6 }),
  ]);

  const total = news.length + releases.length + techs.length + companies.length + models.length + tools.length + repos.length + advisories.length;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Search</h1>
        <div className="panel mt-3 flex items-center gap-3 p-4">
          <Icon name="search" size={18} className="text-[color:var(--text-3)]" />
          <form action="/search" className="flex-1">
            <input name="q" defaultValue={q} autoFocus placeholder="Search everything…" className="h-10 w-full bg-transparent text-[14px] outline-none placeholder:text-[color:var(--text-3)]" />
          </form>
        </div>
        <p className="mt-2 text-[12.5px] text-[color:var(--text-3)]">{total} results for “{q}”</p>
      </div>

      {total === 0 && (
        <EmptyState icon={<Icon name="search" size={26} />} title="No results" sub={`Nothing in the knowledge base matches “${q}”. Try a broader term.`} />
      )}

      {news.length > 0 && (
        <section>
          <SectionHeader title={`News (${news.length})`} />
          <div className="panel divide-y divide-[color:var(--border)] px-4">
            {news.map((n) => <NewsCardSlim key={n.id} item={n} />)}
          </div>
        </section>
      )}

      {releases.length > 0 && (
        <section>
          <SectionHeader title={`Releases (${releases.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {releases.map((r) => (
              <Link key={r.id} href={`/releases/${r.id}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                <BrandAvatar name={r.technology.name} accent={r.technology.accent} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{r.technology.name} <span className="font-mono text-cyan-500">{r.version}</span></div>
                  <div className="mt-0.5 truncate text-[11.5px] text-[color:var(--text-3)]">{r.summary ?? r.technology.name} release</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {techs.length > 0 && (
        <section>
          <SectionHeader title={`Technologies (${techs.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {techs.map((t) => (
              <Link key={t.id} href={`/technologies/${t.slug}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                <BrandAvatar name={t.name} accent={t.accent} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{t.name}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11.5px] text-[color:var(--text-3)]">{t.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {companies.length > 0 && (
        <section>
          <SectionHeader title={`Companies (${companies.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <Link key={c.id} href={`/companies/${c.slug}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                <BrandAvatar name={c.name} accent={c.accent} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{c.name}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11.5px] text-[color:var(--text-3)]">{c.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {models.length > 0 && (
        <section>
          <SectionHeader title={`AI Models (${models.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((m) => (
              <Link key={m.id} href={`/ai/models/${m.slug}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                {m.provider ? <BrandAvatar name={m.provider.name} accent={m.provider.accent} size={30} /> : <BrandAvatar name={m.name} accent="#a78bfa" size={30} />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{m.name}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-[color:var(--text-3)]">{m.provider?.name}{m.contextWindow ? ` · ${(m.contextWindow / 1000).toFixed(0)}K ctx` : ""}</div>
                </div>
                {m.openSource && <Chip tone="accent">Open</Chip>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {tools.length > 0 && (
        <section>
          <SectionHeader title={`AI Tools (${tools.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <Link key={t.id} href={`/ai/tools/${t.slug}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                <BrandAvatar name={t.company?.name ?? t.name} accent={t.company?.accent ?? t.primaryCategory?.color} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{t.name}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-[color:var(--text-3)]">{t.company?.name ?? t.primaryCategory?.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {repos.length > 0 && (
        <section>
          <SectionHeader title={`Repositories (${repos.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((r) => (
              <Link key={r.id} href={`/github/${r.fullName}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[color:var(--panel-2)] text-[color:var(--text-2)]"><Icon name="github" size={16} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[12.5px] font-semibold text-[color:var(--text)]">{r.fullName}</div>
                  <div className="mt-0.5 truncate text-[11.5px] text-[color:var(--text-3)]">★ {formatCount(r.stars)}{r.language ? ` · ${r.language}` : ""}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {advisories.length > 0 && (
        <section>
          <SectionHeader title={`Security advisories (${advisories.length})`} />
          <div className="grid gap-2.5 sm:grid-cols-2">
            {advisories.map((a) => (
              <Link key={a.id} href={`/security/${a.id}`} className="panel panel-hover flex items-center gap-3 p-3.5 no-underline">
                <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400"><Icon name="shield" size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-[color:var(--text)]">{a.cveId ? `${a.cveId} — ` : ""}{a.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[color:var(--text-3)]">
                    {a.technology && <span>{a.technology.name}</span>}
                  </div>
                </div>
                <span className={cnSev(a.severity)}>{a.severity}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function cnSev(sev: string) {
  const map: Record<string, string> = {
    CRITICAL: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/30",
    HIGH: "bg-orange-500/10 text-orange-300 ring-1 ring-inset ring-orange-400/30",
    MEDIUM: "bg-yellow-500/10 text-yellow-300 ring-1 ring-inset ring-yellow-400/30",
    LOW: "bg-slate-500/10 text-slate-300 ring-1 ring-inset ring-slate-400/30",
  };
  return `rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${map[sev] ?? map.LOW}`;
}