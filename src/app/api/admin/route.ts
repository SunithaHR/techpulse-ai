import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { overviewStats } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const [stats, jobs, sources, users, duplicates] = await Promise.all([
    overviewStats(),
    prisma.ingestionJob.findMany({ orderBy: { startedAt: "desc" }, take: 10, include: { source: { select: { name: true } } } }),
    prisma.source.findMany({ orderBy: { reliability: "desc" } }),
    prisma.user.count(),
    prisma.news.groupBy({ by: ["clusterKey"], _count: true, where: { clusterKey: { not: null } } }).then((g) => g.filter((x) => x._count > 1).length),
  ]);
  return Response.json({ ...stats, users, duplicates, jobs, sources });
}