// Ingestion runner: pulls items from sources (RSS, GitHub), deduplicates via
// the SourceItem hash ledger, classifies, links technologies and writes News.
import { prisma } from "@/lib/db";
import { fetchFeed } from "@/lib/ingest/adapters/rss";
import { fetchReleases } from "@/lib/ingest/adapters/github";
import { classifyTitle, makeSummary, hashUrl, hashContent, clusterTitle, cleanSlug } from "@/lib/ingest/classify";
import type { FetchedItem, ClassifiedItem, JobLog } from "@/lib/ingest/types";

const JOB_LIMIT = 60;

export async function runIngestion(opts: { sourceId?: string; kind?: string } = {}): Promise<{ jobs: number; added: number; skipped: number; errors: string[] }> {
  const sources = await prisma.source.findMany({
    where: { active: true, ...(opts.sourceId ? { id: opts.sourceId } : {}) },
    orderBy: { reliability: "desc" },
  });
  const techCatalog = await prisma.technology.findMany({ select: { id: true, name: true, slug: true } });
  const results = { jobs: 0, added: 0, skipped: 0, errors: [] as string[] };

  for (const source of sources) {
    const log: JobLog[] = [{ step: "start", detail: source.name, at: new Date().toISOString() }];
    const job = await prisma.ingestionJob.create({
      data: { kind: opts.kind ?? (source.type === "GITHUB" ? "GITHUB" : "RSS"), sourceId: source.id, status: "RUNNING" },
    });
    try {
      let items: FetchedItem[] = [];
      if (source.type === "GITHUB" && source.feedUrl) {
        items = await fetchReleases(source.feedUrl.replace("https://github.com/", "").replace(/\/releases?$/, ""));
        log.push({ step: "fetch", detail: `${items.length} releases`, at: new Date().toISOString() });
      } else if (source.feedUrl) {
        items = await fetchFeed(source.feedUrl);
        log.push({ step: "fetch", detail: `${items.length} entries`, at: new Date().toISOString() });
      }
      items = items.slice(0, JOB_LIMIT);

      let added = 0;
      let skipped = 0;
      for (const item of items) {
        if (!item.title || !item.url) {
          skipped++;
          continue;
        }
        const urlHash = hashUrl(item.url);
        const dup = await prisma.sourceItem.findUnique({ where: { urlHash } });
        if (dup) {
          skipped++;
          continue;
        }
        await prisma.sourceItem.create({
          data: { sourceId: source.id, urlHash, url: item.url, title: item.title.slice(0, 300), status: "NEW" },
        });

        const classified = classify(item, source.type, source.name, techCatalog);
        if (!classified) {
          skipped++;
          continue;
        }

        const category = await prisma.category.findUnique({ where: { key_type: { key: classified.categoryKey, type: "NEWS" } } });
        if (!category) {
          skipped++;
          continue;
        }

        const existingByCluster = await prisma.news.findFirst({ where: { clusterKey: classified.clusterKey } });
        const isPrimary = !existingByCluster;
        const news = await prisma.news.create({
          data: {
            slug: cleanSlug(classified.title),
            kind: classified.kind,
            title: classified.title.slice(0, 300),
            summary: classified.summary,
            importance: classified.importance,
            tags: classified.tags,
            publishedAt: classified.publishedAt ?? new Date(),
            url: classified.url,
            categoryId: category.id,
            sourceId: source.id,
            clusterKey: classified.clusterKey,
            isPrimary,
            engagement: isPrimary ? 400 : 120,
            analysis: {
              whatChanged: `This story from ${source.name} is about: ${classified.summary}`,
              whyItMatters: `Tracked at ${classified.importance.toLowerCase()} importance — review the linked source for details.`,
              whoAffected: classified.techNames.join(", ") || "Technology teams following this category",
              whatToDo: isPrimary ? "Read the official source and check for release notes or patches." : "Cross-check with the primary (official) source.",
            },
          },
        });
        for (const tech of techCatalog) {
          if (classified.techNames.includes(tech.name)) {
            await prisma.newsTechnology.create({
              data: { newsId: news.id, technologyId: tech.id, isPrimary: tech.name === classified.techNames[0] },
            });
          }
        }
        await prisma.sourceItem.update({ where: { urlHash }, data: { status: "ADDED", itemHash: classified.itemHash } });
        added++;
      }

      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: { status: "DONE", finishedAt: new Date(), itemsFound: items.length, itemsAdded: added, itemsSkipped: skipped, log: JSON.parse(JSON.stringify(log)) },
      });
      await prisma.source.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });
      results.jobs++;
      results.added += added;
      results.skipped += skipped;
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: { status: "FAILED", finishedAt: new Date(), error: msg.slice(0, 500), log: JSON.parse(JSON.stringify(log)) },
      });
      results.errors.push(`${source.name}: ${msg}`);
    }
  }
  return results;
}

function classify(item: FetchedItem, sourceType: string, sourceName: string, techCatalog: Array<{ id: string; name: string; slug: string }>): ClassifiedItem | null {
  const text = `${item.title} ${item.summary ?? item.content ?? ""}`;
  const { categoryKey, importance, kind, tags } = classifyTitle(item.title, text, sourceType);
  const summary = makeSummary(item.summary ?? item.content ?? "", 220);
  const matched: string[] = [];
  for (const t of techCatalog) {
    if (new RegExp(`(^|[^a-z0-9])${t.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(item.title)) {
      matched.push(t.name);
    }
  }
  if (!summary && !matched.length && importance === "LOW") return null;
  return {
    ...item,
    kind,
    categoryKey,
    importance,
    summary,
    tags,
    techNames: matched.slice(0, 3),
    clusterKey: clusterTitle(item.title),
    sourceName,
    sourceType,
    urlHash: hashUrl(item.url),
    itemHash: hashContent(item.title, summary),
  };
}