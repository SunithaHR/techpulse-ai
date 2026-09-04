import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tech = url.searchParams.get("tech") ?? "";
  const sev = url.searchParams.get("severity")?.toUpperCase() ?? "";
  const items = await prisma.securityAdvisory.findMany({
    where: {
      ...(tech ? { technology: { slug: tech } } : {}),
      ...(sev ? { severity: sev } : {}),
    },
    include: { technology: { select: { slug: true, name: true } } },
    orderBy: { publishedAt: "desc" },
    take: Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25),
  });
  return Response.json({ items, count: items.length });
}