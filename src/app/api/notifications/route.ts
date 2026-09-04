import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const items = await prisma.notification.findMany({
    where: { userId: session.sub },
    orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
  const unread = items.filter((n) => n.readAt == null).length;
  return Response.json({ items, unread });
}