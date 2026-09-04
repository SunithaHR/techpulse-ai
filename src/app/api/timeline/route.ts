import { newsTimeline } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rangeDays = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "7", 10) || 7));
  const groups = await newsTimeline(rangeDays, {
    category: url.searchParams.get("category") ?? undefined,
    importance: url.searchParams.get("importance")?.toUpperCase() ?? undefined,
    techSlug: url.searchParams.get("tech") ?? undefined,
    companySlug: url.searchParams.get("company") ?? undefined,
  });
  return Response.json({ rangeDays, days: groups });
}