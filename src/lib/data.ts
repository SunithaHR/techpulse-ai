import { prisma } from "@/lib/db";
import { startOfDayUTC, daysAgo } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

// Shared "include" fragments so list cards and detail pages agree on shape.
export const newsInclude = {
  category: true,
  source: true,
  technologies: { include: { technology: { select: { id: true, slug: true, name: true, accent: true, kind: true } } }, take: 3 },
  companies: { include: { company: { select: { id: true, slug: true, name: true, accent: true } } }, take: 2 },
} satisfies Prisma.NewsInclude;

export type NewsCard = Prisma.NewsGetPayload<{ include: typeof newsInclude }>;

export interface NewsQuery {
  from?: Date;
  to?: Date;
  category?: string; // category key
  importance?: string;
  kind?: string;
  techSlug?: string;
  companySlug?: string;
  q?: string;
  primaryOnly?: boolean;
  take?: number;
  skip?: number;
  orderBy?: Prisma.NewsOrderByWithRelationInput[];
}

export async function queryNews(q: NewsQuery = {}): Promise<NewsCard[]> {
  const where: Prisma.NewsWhereInput = {};
  if (q.from || q.to) {
    where.publishedAt = {};
    if (q.from) where.publishedAt.gte = q.from;
    if (q.to) where.publishedAt.lte = q.to;
  }
  if (q.category) where.category = { key: q.category };
  if (q.importance) where.importance = q.importance;
  if (q.kind) where.kind = q.kind;
  if (q.techSlug) where.technologies = { some: { technology: { slug: q.techSlug } } };
  if (q.companySlug) where.companies = { some: { company: { slug: q.companySlug } } };
  if (q.primaryOnly) where.isPrimary = true;
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: "insensitive" } },
      { summary: { contains: q.q, mode: "insensitive" } },
      { tags: { array_contains: [q.q] } },
    ];
  }
  return prisma.news.findMany({
    where,
    include: newsInclude,
    orderBy: q.orderBy ?? [{ importance: "asc" }, { publishedAt: "desc" }],
    take: q.take ?? 50,
    skip: q.skip ?? 0,
  });
}

export interface NewsDayGroup {
  day: string; // yyyy-MM-dd
  label: string; // "Today" | "Yesterday" | fmt
  date: Date;
  items: NewsCard[];
}

/** Timeline: fetch news across a range, group into date buckets. */
export async function newsTimeline(rangeDays = 7, opts: Omit<NewsQuery, "from" | "to"> = {}): Promise<NewsDayGroup[]> {
  const to = new Date();
  const from = startOfDayUTC(daysAgo(rangeDays - 1));
  const items = await queryNews({ ...opts, from, to: new Date(to.setHours(23, 59, 59, 999)), primaryOnly: true, take: 400 });
  return groupByDay(items);
}

export function groupByDay(items: NewsCard[]): NewsDayGroup[] {
  const map = new Map<string, NewsCard[]>();
  for (const it of items) {
    const key = it.publishedAt.toISOString().slice(0, 10);
    const arr = map.get(key) ?? [];
    arr.push(it);
    map.set(key, arr);
  }
  const out: NewsDayGroup[] = [];
  for (const [key, list] of map) {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(Date.UTC(y!, m! - 1, d!));
    const diff = Math.round((Date.now() - date.getTime()) / 86_400_000);
    out.push({
      day: key,
      label: diff <= 0 ? "Today" : diff === 1 ? "Yesterday" : key,
      date,
      items: list.sort((a, b) => b.importance.localeCompare(a.importance) || b.publishedAt.getTime() - a.publishedAt.getTime()),
    });
  }
  return out.sort((a, b) => b.day.localeCompare(a.day));
}

/** Featured/curated "top stories" for a day — highest importance first. */
export async function topStories(days = 1, take = 8) {
  const items = await queryNews({ from: startOfDayUTC(daysAgo(days - 1)), primaryOnly: true, take: 80 });
  return items
    .sort((a, b) => (importanceRank(b.importance) - importanceRank(a.importance)) || b.engagement - a.engagement || b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, take);
}

function importanceRank(i: string): number {
  return i === "CRITICAL" ? 3 : i === "HIGH" ? 2 : i === "MEDIUM" ? 1 : 0;
}

export interface ReleaseQuery {
  from?: Date;
  to?: Date;
  importance?: string;
  kind?: string;
  techSlug?: string;
  companySlug?: string;
  featuredOnly?: boolean;
  take?: number;
  skip?: number;
}

export const releaseInclude = {
  technology: { select: { id: true, slug: true, name: true, accent: true, kind: true, githubUrl: true, website: true } },
  company: { select: { id: true, slug: true, name: true, accent: true } },
  _count: { select: { news: true } },
} satisfies Prisma.ReleaseInclude;

export type ReleaseRow = Prisma.ReleaseGetPayload<{ include: typeof releaseInclude }>;

export async function queryReleases(q: ReleaseQuery = {}): Promise<ReleaseRow[]> {
  const where: Prisma.ReleaseWhereInput = {};
  if (q.from || q.to) {
    where.announcedOn = {};
    if (q.from) where.announcedOn.gte = q.from;
    if (q.to) where.announcedOn.lte = q.to;
  }
  if (q.importance) where.importance = q.importance;
  if (q.kind) where.kind = q.kind;
  if (q.techSlug) where.technology = { slug: q.techSlug };
  if (q.companySlug) where.company = { slug: q.companySlug };
  if (q.featuredOnly) where.technology = { ...(where.technology as object ?? {}), isFeatured: true };
  return prisma.release.findMany({
    where,
    include: releaseInclude,
    orderBy: [{ announcedOn: "desc" }],
    take: q.take ?? 60,
    skip: q.skip ?? 0,
  });
}

export async function latestReleaseFor(techSlug: string): Promise<ReleaseRow | null> {
  return prisma.release.findFirst({
    where: { technology: { slug: techSlug } },
    include: releaseInclude,
    orderBy: { announcedOn: "desc" },
  });
}

// ── Tech-heavy page helpers ─────────────────────────────────────────────────
export async function techDetail(slug: string) {
  const tech = await prisma.technology.findUnique({
    where: { slug },
    include: {
      category: true,
      company: true,
      _count: { select: { releases: true, newsLinks: true, advisories: true } },
    },
  });
  if (!tech) return null;
  const [releases, news, advisories, repo] = await Promise.all([
    prisma.release.findMany({
      where: { technologyId: tech.id },
      include: releaseInclude,
      orderBy: { announcedOn: "desc" },
      take: 12,
    }),
    queryNews({ techSlug: slug, primaryOnly: true, take: 12 }),
    prisma.securityAdvisory.findMany({ where: { technologyId: tech.id }, orderBy: { publishedAt: "desc" }, take: 6 }),
    prisma.repository.findFirst({ where: { technologyId: tech.id } }),
  ]);
  return { tech, releases, news, advisories, repo };
}

export async function companyDetail(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug },
    include: { _count: { select: { technologies: true, aiModels: true, aiTools: true, releases: true } } },
  });
  if (!company) return null;
  const [models, tools, news, releases, techs] = await Promise.all([
    prisma.aIModel.findMany({ where: { providerId: company.id }, orderBy: { releasedOn: "desc" }, take: 8 }),
    prisma.aITool.findMany({ where: { companyId: company.id }, orderBy: { launchDate: "desc" }, take: 8 }),
    queryNews({ companySlug: slug, primaryOnly: true, take: 12 }),
    prisma.release.findMany({ where: { companyId: company.id }, include: releaseInclude, orderBy: { announcedOn: "desc" }, take: 8 }),
    prisma.technology.findMany({ where: { companyId: company.id }, take: 30 }),
  ]);
  return { company, models, tools, news, releases, techs };
}

export async function modelDetail(slug: string) {
  const model = await prisma.aIModel.findUnique({ where: { slug }, include: { provider: true } });
  if (!model) return null;
  const siblings = model.family
    ? await prisma.aIModel.findMany({ where: { family: model.family, id: { not: model.id } }, include: { provider: true }, orderBy: { releasedOn: "desc" }, take: 8 })
    : [];
  const relatedNews = await queryNews({ q: model.family ?? model.name.split(" ").slice(0, 2).join(" "), primaryOnly: true, take: 6 });
  return { model, siblings, relatedNews };
}

export async function toolDetail(slug: string) {
  const tool = await prisma.aITool.findUnique({ where: { slug }, include: { company: true, primaryCategory: true } });
  if (!tool) return null;
  const relatedNews = await queryNews({ q: tool.name, primaryOnly: true, take: 6 });
  return { tool, relatedNews };
}

// ── Personalization services ────────────────────────────────────────────────
export async function userFollowedTechs(userId: string) {
  const rows = await prisma.follow.findMany({ where: { userId, entityType: "TECHNOLOGY" } });
  return rows;
}

export async function notificationsForUser(userId: string, limit = 50) {
  return prisma.notification.findMany({ where: { userId }, orderBy: [{ readAt: "asc" }, { createdAt: "desc" }], take: limit });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function categoryStats() {
  const news = await prisma.news.groupBy({ by: ["categoryId"], _count: true });
  const cats = await prisma.category.findMany({ where: { type: "NEWS" } });
  const byKey = new Map(news.map((n) => [n.categoryId, n._count]));
  return cats
    .map((c) => ({ ...c, count: byKey.get(c.id) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}

export async function overviewStats() {
  const [news, releases, models, tools, advisories, companies, techs, repos, critical, high] = await Promise.all([
    prisma.news.count(),
    prisma.release.count(),
    prisma.aIModel.count(),
    prisma.aITool.count(),
    prisma.securityAdvisory.count(),
    prisma.company.count(),
    prisma.technology.count(),
    prisma.repository.count(),
    prisma.news.count({ where: { importance: "CRITICAL" } }),
    prisma.news.count({ where: { importance: "HIGH" } }),
  ]);
  return { news, releases, models, tools, advisories, companies, techs, repos, critical, high };
}
