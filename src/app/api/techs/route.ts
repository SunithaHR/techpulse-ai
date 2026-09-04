import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.technology.findMany({
    include: { category: true, company: { select: { slug: true, name: true } }, _count: { select: { releases: true, advisories: true } } },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
  return Response.json({ items, count: items.length });
}