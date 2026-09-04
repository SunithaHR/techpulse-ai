import Link from "next/link";
import type { NewsCard, ReleaseRow } from "@/lib/data";
import { BrandAvatar, ImportanceBadge, KindChip, Chip, Meta, ExternalLink, Stars } from "@/components/ui";
import { Icon } from "@/components/icons";
import { cn, fmtDate, timeAgo, formatCount, asArray, asObject, asString } from "@/lib/utils";
import { RELEASE_KIND_LABEL } from "@/lib/constants";

type AnyNews = NewsCard;

// ── News card (feed / timeline / lists) ─────────────────────────────────────
export function NewsCardItem({ item, cluster = 0, className, hideKind }: { item: AnyNews; cluster?: number; className?: string; hideKind?: boolean }) {
  const cat = item.category;
  return (
    <article className={cn("panel panel-hover group p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {!hideKind && <KindChip kind={item.kind} />}
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: cat?.color ?? undefined }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat?.color }} />
            {cat?.emoji} {cat?.name}
          </span>
        </div>
        <ImportanceBadge importance={item.importance} />
      </div>
      <h3 className="mt-2.5 text-[14.5px] font-semibold leading-snug tracking-tight">
        <Link href={`/news/${item.id}`} className="text-[color:var(--text)] underline-offset-2 group-hover:underline">{item.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[12.8px] leading-relaxed text-[color:var(--text-2)]">{item.summary}</p>

      {(item.technologies.length > 0 || item.companies.length > 0) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {item.companies.map((c) => (
            <Link key={c.companyId} href={`/companies/${c.company.slug}`} className="no-underline">
              <Chip>{c.company.name}</Chip>
            </Link>
          ))}
          {item.technologies.slice(0, 3).map((t) => (
            <Link key={t.technologyId} href={`/technologies/${t.technology.slug}`} className="no-underline">
              <Chip tone="brand">{t.technology.name}</Chip>
            </Link>
          ))}
        </div>
      )}

      <Meta className="mt-3">
        <span className="inline-flex items-center gap-1 text-[color:var(--text-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80" /> {item.source.name}
        </span>
        <time dateTime={item.publishedAt.toISOString()}>{timeAgo(item.publishedAt)}</time>
        {cluster > 0 && (
          <span className="inline-flex items-center gap-1 rounded bg-[color:var(--panel-2)] px-1.5 py-px text-[10.5px] ring-1 ring-inset ring-[color:var(--border)]">
            <Icon name="link" size={10} /> {cluster} more sources
          </span>
        )}
      </Meta>
    </article>
  );
}

export function NewsCardSlim({ item, className }: { item: AnyNews; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 border-b border-[color:var(--border)] py-2.5 last:border-0", className)}>
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.category?.color }} />
      <div className="min-w-0 flex-1">
        <Link href={`/news/${item.id}`} className="line-clamp-2 text-[13px] font-medium leading-snug text-[color:var(--text)] hover:text-cyan-600 dark:hover:text-cyan-300">
          {item.title}
        </Link>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-[color:var(--text-3)]">
          <span>{item.source.name}</span>
          <span>·</span>
          <time dateTime={item.publishedAt.toISOString()}>{timeAgo(item.publishedAt)}</time>
          {item.importance !== "LOW" && <ImportanceBadge importance={item.importance} />}
        </div>
      </div>
    </div>
  );
}

// ── Release card ────────────────────────────────────────────────────────────
export function ReleaseCard({ item, className }: { item: ReleaseRow; className?: string }) {
  const log = asObject<Record<string, string[]>>(item.changelog);
  const highlights = asArray<string>(log.highlights ?? []);
  const sec = asArray<string>(log.security ?? []);
  const breaking = asArray<string>(log.breaking ?? []);
  const t = item.technology;
  return (
    <article className={cn("panel panel-hover group p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href={`/technologies/${t.slug}`} className="no-underline"><BrandAvatar name={t.name} accent={t.accent} size={30} /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/releases/${item.id}`} className="truncate text-[14px] font-semibold tracking-tight text-[color:var(--text)] hover:text-cyan-600 dark:hover:text-cyan-300">
                {t.name} {item.version}
              </Link>
              <span className="rounded bg-[color:var(--panel-2)] px-1.5 py-px font-mono text-[10.5px] text-[color:var(--text-2)] ring-1 ring-inset ring-[color:var(--border)]">
                {RELEASE_KIND_LABEL[item.kind] ?? item.kind}
              </span>
            </div>
            <div className="mt-0.5 text-[11.5px] text-[color:var(--text-3)]">
              {item.previousVersion && <span className="mr-1.5 text-[color:var(--text-3)]">from {t.name} {item.previousVersion}</span>}
              <time dateTime={item.announcedOn.toISOString()}>{fmtDate(item.announcedOn)}</time>
              <span className="ml-1.5">· {t.kind.toLowerCase()}</span>
            </div>
          </div>
        </div>
        <ImportanceBadge importance={item.importance} />
      </div>

      {item.summary && <p className="mt-2 line-clamp-2 text-[12.8px] leading-relaxed text-[color:var(--text-2)]">{item.summary}</p>}

      {(highlights.length > 0 || breaking.length > 0) && (
        <ul className="mt-2.5 space-y-1">
          {highlights.slice(0, 2).map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-[12.3px] text-[color:var(--text-2)]">
              <Icon name="zap" size={12} className="mt-0.5 shrink-0 text-cyan-500/80" /> {h}
            </li>
          ))}
          {breaking.length > 0 && (
            <li className="flex items-start gap-2 text-[12.3px] font-medium text-orange-400/90">
              <Icon name="alert" size={12} className="mt-0.5 shrink-0" /> Breaking: {breaking[0]}
            </li>
          )}
          {sec.length > 0 && (
            <li className="flex items-start gap-2 text-[12.3px] font-medium text-red-400/90">
              <Icon name="lock" size={12} className="mt-0.5 shrink-0" /> {sec[0]}
            </li>
          )}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between">
        <Meta>
          {item.company && <Link href={`/companies/${item.company.slug}`} className="hover:text-cyan-600 dark:hover:text-cyan-300">{item.company.name}</Link>}
          <span className="text-[color:var(--text-3)]">{item._count.news > 0 ? `${item._count.news} story${item._count.news > 1 ? "s" : ""}` : "no coverage"}</span>
        </Meta>
        {t.githubUrl && <ExternalLink href={t.githubUrl} className="flex items-center gap-1 text-[11px]"><Icon name="github" size={12} /> Release notes</ExternalLink>}
      </div>
    </article>
  );
}

// ── Compact rows for index pages ────────────────────────────────────────────
export function ListRow({ href, name, sub, right, icon }: { href: string; name: string; sub?: React.ReactNode; right?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link href={href} className="panel panel-hover flex items-center gap-3 p-3.5">
      {icon}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-[color:var(--text)]">{name}</div>
        {sub && <div className="mt-0.5 line-clamp-1 text-[12px] text-[color:var(--text-3)]">{sub}</div>}
      </div>
      {right}
      <Icon name="chevron-right" size={15} className="shrink-0 text-[color:var(--text-3)]" />
    </Link>
  );
}

// ── Model / tool / repo / advisory row cards ────────────────────────────────
export function ModelRowCard({ m }: { m: { slug: string; name: string; description: string; contextWindow?: number | null; openSource: boolean; pricing?: unknown; releasedOn?: Date | null; provider?: { slug: string; name: string; accent?: string | null } | null; isFeatured?: boolean } }) {
  const p = asObject<{ inputPerM?: number }>(m.pricing);
  return (
    <article className="panel panel-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {m.provider && <Link href={`/companies/${m.provider.slug}`}><BrandAvatar name={m.provider.name} accent={m.provider.accent} size={32} /></Link>}
          <div className="min-w-0">
            <Link href={`/ai/models/${m.slug}`} className="text-[14px] font-semibold text-[color:var(--text)] hover:text-cyan-600 dark:hover:text-cyan-300">{m.name}</Link>
            <div className="mt-0.5 text-[11.5px] text-[color:var(--text-3)]">
              {m.provider?.name}
              {m.releasedOn && <> · {fmtDate(m.releasedOn)}</>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {m.openSource && <Chip tone="accent">Open</Chip>}
          {m.contextWindow ? <Chip>{(m.contextWindow / 1000).toFixed(0)}K ctx</Chip> : null}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--text-2)]">{m.description}</p>
      <div className="mt-2.5 text-[11.5px] text-[color:var(--text-3)]">
        {p.inputPerM != null ? <>API · ${p.inputPerM} / 1M input</> : <>No public API pricing</>}
      </div>
    </article>
  );
}

export function ToolRowCard({ t }: { t: { slug: string; name: string; description: string; pricingModel: string; priceLabel?: string | null; apiAvailable: boolean; launchDate?: Date | null; company?: { slug: string; name: string; accent?: string | null } | null; primaryCategory?: { name: string; emoji: string; color: string } | null; isFeatured?: boolean } }) {
  return (
    <article className="panel panel-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {t.company ? (
            <Link href={`/companies/${t.company.slug}`}><BrandAvatar name={t.company.name} accent={t.company.accent} size={32} /></Link>
          ) : (
            <BrandAvatar name={t.name} accent={t.primaryCategory?.color} size={32} />
          )}
          <div className="min-w-0">
            <Link href={`/ai/tools/${t.slug}`} className="text-[14px] font-semibold text-[color:var(--text)] hover:text-cyan-600 dark:hover:text-cyan-300">{t.name}</Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[color:var(--text-3)]">
              <span>{t.company?.name ?? t.primaryCategory?.name}</span>
              {t.primaryCategory && (
                <span className="inline-flex items-center gap-1 text-[10.5px]">{t.primaryCategory.emoji} {t.primaryCategory.name}</span>
              )}
            </div>
          </div>
        </div>
        <Chip>{t.pricingModel === "FREE" ? "Free" : t.pricingModel === "FREEMIUM" ? "Free / Paid" : t.pricingModel === "OPEN_SOURCE" ? "Open source" : t.pricingModel === "ENTERPRISE" ? "Enterprise" : "Paid"}</Chip>
      </div>
      <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[color:var(--text-2)]">{t.description}</p>
      <div className="mt-2.5 flex items-center gap-3 text-[11.5px] text-[color:var(--text-3)]">
        {t.apiAvailable ? <span className="inline-flex items-center gap-1 text-emerald-500/90"><Icon name="check-circle" size={12} /> API</span> : null}
        {t.launchDate && <span>Launched {fmtDate(t.launchDate)}</span>}
      </div>
    </article>
  );
}

export function RepoRowCard({ r }: { r: { fullName: string; description?: string | null; language?: string | null; stars: number; openIssues?: number | null; license?: string | null; latestRelease?: unknown; isFeatured?: boolean; homepage?: string | null } }) {
  const lr = asObject<{ tag?: string; date?: string }>(r.latestRelease);
  const [owner, name] = r.fullName.split("/");
  return (
    <article className="panel panel-hover p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-0.5 text-[color:var(--text-3)]"><Icon name="github" size={18} /></span>
          <div className="min-w-0">
            <Link href={`/github/${r.fullName}`} className="text-[13.5px] font-semibold text-[color:var(--text)] hover:text-cyan-600 dark:hover:text-cyan-300">
              <span className="text-[color:var(--text-3)]">{owner}/</span>{name}
            </Link>
            {r.description && <p className="mt-1 line-clamp-1 text-[12.3px] text-[color:var(--text-2)]">{r.description}</p>}
          </div>
        </div>
        <Stars n={r.stars} />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[11.5px] text-[color:var(--text-3)]">
        {r.language && <Chip>{r.language}</Chip>}
        {r.license && <span>{r.license}</span>}
        {r.openIssues != null && <span>{r.openIssues} issues</span>}
        {lr.tag && <span className="inline-flex items-center gap-1"><Icon name="package" size={12} /> {lr.tag}{lr.date ? ` · ${fmtDate(lr.date)}` : ""}</span>}
      </div>
    </article>
  );
}

export function AdvisoryRow({ a }: { a: { id: string; cveId?: string | null; title: string; severity: string; cvssScore?: number | null; description: string; publishedAt: Date; technology?: { slug: string; name: string } | null; affected?: unknown; status: string } }) {
  return (
    <article className="panel panel-hover p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {a.cveId ? (
            <span className="font-mono text-[12px] font-semibold text-red-400">{a.cveId}</span>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--text-3)]">Advisory</span>
          )}
          {a.technology && (
            <Link href={`/technologies/${a.technology.slug}`}><Chip tone="brand">{a.technology.name}</Chip></Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {a.cvssScore != null && <span className="font-mono text-[11px] text-[color:var(--text-3)]">CVSS {a.cvssScore.toFixed(1)}</span>}
          <ImportanceBadge importance={a.severity} />
        </div>
      </div>
      <h3 className="mt-2 text-[14px] font-semibold leading-snug">
        <Link href={`/security/${a.id}`} className="text-[color:var(--text)] hover:text-cyan-600 dark:hover:text-cyan-300">{a.title}</Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[12.6px] leading-relaxed text-[color:var(--text-2)]">{a.description}</p>
      <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-[color:var(--text-3)]">
        <time dateTime={a.publishedAt.toISOString()}>{timeAgo(a.publishedAt)}</time>
        <span>{a.status}</span>
      </div>
    </article>
  );
}
