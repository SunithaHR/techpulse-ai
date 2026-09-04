import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const lang = url.searchParams.get("lang") ?? "";
  const like = q ? { contains: q, mode: "insensitive" as const } : undefined;
  const items = await prisma.repository.findMany({
    where: {
      ...(like ? { OR: [{ fullName: like }, { description: like }] } : {}),
      ...(lang ? { language: lang } : {}),
    },
    orderBy: { stars: "desc" },
    take: Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
  });
  return Response.json({ items, count: items.length });
}