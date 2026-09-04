import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const company = url.searchParams.get("company") ?? "";
  const like = q ? { contains: q, mode: "insensitive" as const } : undefined;
  const items = await prisma.aIModel.findMany({
    where: {
      ...(like ? { OR: [{ name: like }, { description: like }, { family: like }] } : {}),
      ...(company ? { provider: { slug: company } } : {}),
    },
    include: { provider: { select: { slug: true, name: true, accent: true } } },
    orderBy: [{ isFeatured: "desc" }, { releasedOn: "desc" }],
    take: Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
  });
  return Response.json({ items, count: items.length });
}