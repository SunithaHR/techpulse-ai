import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.company.findMany({
    include: { _count: { select: { aiModels: true, aiTools: true, releases: true, technologies: true } } },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  });
  return Response.json({ items, count: items.length });
}