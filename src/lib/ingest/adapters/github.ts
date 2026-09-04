// GitHub releases adapter — fetches recent releases for a repository via the
// public API (optionally authenticated with GITHUB_TOKEN for higher rate limits).
import type { FetchedItem } from "@/lib/ingest/types";

export interface GithubReleaseItem extends FetchedItem {
  tag: string;
  prerelease: boolean;
}

export async function fetchReleases(repo: string, count = 15): Promise<GithubReleaseItem[]> {
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error(`invalid repo: ${repo}`);
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "TechPulseAI/0.1" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}/releases?per_page=${count}`, { headers, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`github ${res.status} for ${repo}`);
  const data = (await res.json()) as Array<{
    tag_name: string;
    name?: string | null;
    html_url: string;
    published_at: string;
    prerelease: boolean;
    body?: string | null;
  }>;
  return data.map((r) => ({
    title: `${repo} ${r.tag_name}${r.name && r.name !== r.tag_name ? ` — ${r.name}` : ""}`,
    url: r.html_url,
    tag: r.tag_name,
    prerelease: r.prerelease,
    content: r.body ?? undefined,
    publishedAt: new Date(r.published_at),
  }));
}