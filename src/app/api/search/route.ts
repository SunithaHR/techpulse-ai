import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(20, parseInt(url.searchParams.get("limit") ?? "5", 10) || 5);
  if (!q) return Response.json({ q, results: {} });

  const like = { contains: q, mode: "insensitive" as const };
  const [news, releases, technologies, companies, models, tools, repositories, advisories] = await Promise.all([
    prisma.news.findMany({ where: { isPrimary: true, OR: [{ title: like }, { summary: like }] }, orderBy: { publishedAt: "desc" }, take: limit, select: { id: true, title: true, summary: true, publishedAt: true, importance: true } }),
    prisma.release.findMany({ where: { OR: [{ version: like }, { technology: { name: like } }] }, include: { technology: { select: { slug: true, name: true } } }, orderBy: { announcedOn: "desc" }, take: limit }),
    prisma.technology.findMany({ where: { OR: [{ name: like }, { description: like }] }, orderBy: { isFeatured: "desc" }, take: limit }),
    prisma.company.findMany({ where: { OR: [{ name: like }, { description: like }] }, orderBy: { isFeatured: "desc" }, take: limit }),
    prisma.aIModel.findMany({ where: { OR: [{ name: like }, { description: like }] }, include: { provider: { select: { slug: true, name: true } } }, orderBy: { releasedOn: "desc" }, take: limit }),
    prisma.aITool.findMany({ where: { OR: [{ name: like }, { description: like }] }, include: { company: { select: { slug: true, name: true } } }, orderBy: { launchDate: "desc" }, take: limit }),
    prisma.repository.findMany({ where: { OR: [{ fullName: like }, { description: like }] }, orderBy: { stars: "desc" }, take: limit }),
    prisma.securityAdvisory.findMany({ where: { OR: [{ title: like }, { cveId: like }] }, orderBy: { publishedAt: "desc" }, take: limit }),
  ]);

  return Response.json({
    q,
    NEWS: news.map((n) => ({ id: n.id, title: n.title, sub: n.summary, href: `/news/${n.id}`, date: n.publishedAt.toISOString().slice(0, 10), importance: n.importance })),
    RELEASES: releases.map((r) => ({ id: r.id, title: `${r.technology.name} ${r.version}`, sub: r.summary, href: `/releases/${r.id}`, date: r.announcedOn.toISOString().slice(0, 10) })),
    TECHNOLOGIES: technologies.map((t) => ({ id: t.id, name: t.name, sub: t.description, href: `/technologies/${t.slug}`, slug: t.slug })),
    COMPANIES: companies.map((c) => ({ id: c.id, name: c.name, sub: c.description, href: `/companies/${c.slug}`, slug: c.slug })),
    MODELS: models.map((m) => ({ id: m.id, name: m.name, sub: m.provider?.name, href: `/ai/models/${m.slug}`, slug: m.slug })),
    TOOLS: tools.map((t) => ({ id: t.id, name: t.name, sub: t.company?.name, href: `/ai/tools/${t.slug}`, slug: t.slug })),
    REPOSITORIES: repositories.map((r) => ({ id: r.id, name: r.fullName, sub: r.description, href: `/github/${r.fullName}`, stars: r.stars })),
    ADVISORIES: advisories.map((a) => ({ id: a.id, title: a.cveId ? `${a.cveId} — ${a.title}` : a.title, sub: a.severity, href: `/security/${a.id}` })),
  });
}