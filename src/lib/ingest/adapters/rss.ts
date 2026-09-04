// RSS / Atom feed adapter — fetches a feed and normalizes entries.
import { parseXml, findAll, childText, findText } from "@/lib/ingest/xml";
import type { FetchedItem } from "@/lib/ingest/types";

export async function fetchFeed(feedUrl: string): Promise<FetchedItem[]> {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "TechPulseAI/0.1 (+https://techpulse.local)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`feed ${res.status} for ${feedUrl}`);
  const text = await res.text();
  const root = parseXml(text);
  const isAtom = root.tag === "feed";

  if (isAtom) {
    const entries = findAll(root, "entry");
    return entries.map((e) => {
      const title = findText(e, "title");
      const link = e.children.find((c) => c.tag === "link");
      const url = link?.attrs?.href ?? findText(e, "link");
      const content = findText(e, "content") || findText(e, "summary");
      const published = findText(e, "published") || findText(e, "updated");
      return {
        title,
        url,
        content,
        publishedAt: published ? safeDate(published) : undefined,
      } satisfies FetchedItem;
    });
  }

  const items = findAll(root, "item");
  return items.map((e) => {
    const title = childText(e, "title");
    const url = childText(e, "link");
    const content = childText(e, "description") || childText(e, "content:encoded");
    const published = childText(e, "pubDate");
    return {
      title,
      url,
      content,
      publishedAt: published ? safeDate(published) : undefined,
    } satisfies FetchedItem;
  });
}

function safeDate(s: string): Date | undefined {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}