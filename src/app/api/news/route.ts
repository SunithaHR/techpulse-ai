import { queryNews } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const items = await queryNews({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    category: url.searchParams.get("category") ?? undefined,
    importance: url.searchParams.get("importance")?.toUpperCase() ?? undefined,
    kind: url.searchParams.get("kind") ?? undefined,
    techSlug: url.searchParams.get("tech") ?? undefined,
    companySlug: url.searchParams.get("company") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    take: Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
    skip: parseInt(url.searchParams.get("skip") ?? "0", 10) || 0,
  });
  return Response.json({ items, count: items.length });
}