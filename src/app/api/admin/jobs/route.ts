import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const jobs = await prisma.ingestionJob.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
    include: { source: { select: { name: true, slug: true } } },
  });
  return Response.json({ items: jobs });
}