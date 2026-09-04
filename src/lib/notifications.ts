// Notification materializer: creates Notification rows for a user's followed
// entities when new content (releases, advisories, model/tool launches, news)
// arrives. Fingerprints make the writes idempotent per user.
import { prisma } from "@/lib/db";
import { daysAgo } from "@/lib/utils";

export async function materializeForUser(userId: string): Promise<number> {
  const follows = await prisma.follow.findMany({ where: { userId } });
  if (follows.length === 0) return 0;

  const techIds = follows.filter((f) => f.entityType === "TECHNOLOGY").map((f) => f.entityId);
  const companyIds = follows.filter((f) => f.entityType === "COMPANY").map((f) => f.entityId);
  const modelIds = follows.filter((f) => f.entityType === "AIMODEL").map((f) => f.entityId);
  const toolIds = follows.filter((f) => f.entityType === "AITOOL").map((f) => f.entityId);

  const since = daysAgo(2);
  let created = 0;

  const upsert = async (kind: string, fingerprint: string, title: string, body: string, link: string | null, importance: string | null, entityType: string | null, entityId: string | null) => {
    const existing = await prisma.notification.findUnique({ where: { userId_fingerprint: { userId, fingerprint } } });
    if (existing) return;
    await prisma.notification.create({ data: { userId, kind, fingerprint, title: title.slice(0, 200), body: body.slice(0, 300), link, importance, entityType, entityId } });
    created++;
  };

  if (techIds.length) {
    const releases = await prisma.release.findMany({
      where: { announcedOn: { gte: since }, technologyId: { in: techIds } },
      include: { technology: { select: { slug: true, name: true } } },
      orderBy: { announcedOn: "desc" },
      take: 30,
    });
    for (const r of releases) {
      await upsert("RELEASE", `rel:${r.id}`, `${r.technology.name} ${r.version} released`, r.summary ?? "New release", `/releases/${r.id}`, r.importance, "RELEASE", r.id);
    }
    const advisories = await prisma.securityAdvisory.findMany({
      where: { publishedAt: { gte: since }, technologyId: { in: techIds } },
      include: { technology: { select: { slug: true, name: true } } },
      take: 20,
    });
    for (const a of advisories) {
      await upsert("SECURITY", `adv:${a.id}`, a.cveId ? `${a.cveId} — ${a.title}` : a.title, a.description, `/security/${a.id}`, a.severity, "ADVISORY", a.id);
    }
  }

  if (companyIds.length) {
    const news = await prisma.news.findMany({
      where: { publishedAt: { gte: since }, isPrimary: true, companies: { some: { companyId: { in: companyIds } } } },
      take: 20,
    });
    for (const n of news) {
      await upsert("COMPANY", `news:${n.id}`, n.title, n.summary, `/news/${n.id}`, n.importance, "NEWS", n.id);
    }
  }

  if (modelIds.length) {
    const models = await prisma.aIModel.findMany({ where: { releasedOn: { gte: since }, id: { in: modelIds } }, take: 20 });
    for (const m of models) {
      await upsert("MODEL", `model:${m.id}`, `${m.name} released`, m.description, `/ai/models/${m.slug}`, "HIGH", "AIMODEL", m.slug);
    }
  }

  if (toolIds.length) {
    const tools = await prisma.aITool.findMany({ where: { launchDate: { gte: since }, id: { in: toolIds } }, take: 20 });
    for (const t of tools) {
      await upsert("TOOL", `tool:${t.id}`, `${t.name} launched`, t.description, `/ai/tools/${t.slug}`, "MEDIUM", "AITOOL", t.slug);
    }
  }

  return created;
}