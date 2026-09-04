import { ENTITY_TYPE, ENTITY_TYPE_LABEL } from "@/lib/constants";

// Maps an { entityType, entityId } pair to a human label and an in-app route.
// Used by watchlist / saved / notifications / chat citations.
export interface EntityLink {
  label: string;
  href: string;
  typeLabel: string;
}

export function entityHref(entityType: string, entityId: string): string {
  switch (entityType) {
    case ENTITY_TYPE.TECHNOLOGY:
      return `/technologies/${entityId}`;
    case ENTITY_TYPE.COMPANY:
      return `/companies/${entityId}`;
    case ENTITY_TYPE.AIMODEL:
      return `/ai/models/${entityId}`;
    case ENTITY_TYPE.AITOOL:
      return `/ai/tools/${entityId}`;
    case ENTITY_TYPE.REPOSITORY:
      return `/github/${entityId}`;
    case ENTITY_TYPE.NEWS:
      return `/news/${entityId}`;
    case ENTITY_TYPE.RELEASE:
      return `/releases/${entityId}`;
    case ENTITY_TYPE.ADVISORY:
      return `/security/${entityId}`;
    default:
      return "/dashboard";
  }
}

export function entityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABEL[entityType] ?? "Item";
}

/**
 * Resolve a generic reference into a display label + href by looking the
 * entity up in the database. entityId is a slug for most entities, an id for
 * news/releases/advisories and a free label for topics.
 */
export async function resolveEntity(entityType: string, entityId: string): Promise<EntityLink | null> {
  const { prisma } = await import("@/lib/db");
  switch (entityType) {
    case ENTITY_TYPE.TECHNOLOGY: {
      const t = await prisma.technology.findUnique({ where: { slug: entityId } });
      return t ? { label: t.name, href: `/technologies/${t.slug}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.COMPANY: {
      const c = await prisma.company.findUnique({ where: { slug: entityId } });
      return c ? { label: c.name, href: `/companies/${c.slug}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.AIMODEL: {
      const m = await prisma.aIModel.findUnique({ where: { slug: entityId } });
      return m ? { label: m.name, href: `/ai/models/${m.slug}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.AITOOL: {
      const t = await prisma.aITool.findUnique({ where: { slug: entityId } });
      return t ? { label: t.name, href: `/ai/tools/${t.slug}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.REPOSITORY: {
      const r = await prisma.repository.findUnique({ where: { fullName: entityId } });
      return r ? { label: r.fullName, href: `/github/${r.fullName}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.NEWS: {
      const n = await prisma.news.findUnique({ where: { id: entityId } });
      return n ? { label: n.title, href: `/news/${n.id}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.RELEASE: {
      const r = await prisma.release.findUnique({ where: { id: entityId }, include: { technology: true } });
      return r
        ? { label: `${r.technology.name} ${r.version}`, href: `/releases/${r.id}`, typeLabel: entityTypeLabel(entityType) }
        : null;
    }
    case ENTITY_TYPE.ADVISORY: {
      const a = await prisma.securityAdvisory.findUnique({ where: { id: entityId } });
      return a ? { label: a.cveId ? `${a.cveId} — ${a.title}` : a.title, href: `/security/${a.id}`, typeLabel: entityTypeLabel(entityType) } : null;
    }
    case ENTITY_TYPE.TOPIC:
      return { label: entityId, href: `/search?q=${encodeURIComponent(entityId)}`, typeLabel: entityTypeLabel(entityType) };
    default:
      return null;
  }
}

/** Lightweight variant that does not hit the DB — for topic-style rows. */
export function topicLink(topic: string) {
  return { label: topic, href: `/search?q=${encodeURIComponent(topic)}`, typeLabel: entityTypeLabel(ENTITY_TYPE.TOPIC) };
}
