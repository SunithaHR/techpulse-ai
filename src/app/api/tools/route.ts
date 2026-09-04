import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const cat = url.searchParams.get("cat") ?? "";
  const like = q ? { contains: q, mode: "insensitive" as const } : undefined;
  const items = await prisma.aITool.findMany({
    where: {
      ...(like ? { OR: [{ name: like }, { description: like }] } : {}),
      ...(cat ? { primaryCategory: { key: cat } } : {}),
    },
    include: { company: { select: { slug: true, name: true, accent: true } }, primaryCategory: true },
    orderBy: [{ isFeatured: "desc" }, { launchDate: "desc" }],
    take: Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
  });
  return Response.json({ items, count: items.length });
}