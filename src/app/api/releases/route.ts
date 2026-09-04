import { queryReleases } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const items = await queryReleases({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    importance: url.searchParams.get("importance")?.toUpperCase() ?? undefined,
    techSlug: url.searchParams.get("tech") ?? undefined,
    companySlug: url.searchParams.get("company") ?? undefined,
    take: Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
    skip: parseInt(url.searchParams.get("skip") ?? "0", 10) || 0,
  });
  return Response.json({ items, count: items.length });
}