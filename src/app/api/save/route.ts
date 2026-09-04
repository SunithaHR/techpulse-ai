import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { entityType, entityId } = await req.json().catch(() => ({}));
  if (!entityType || !entityId) return Response.json({ error: "entityType and entityId are required" }, { status: 400 });

  const existing = await prisma.savedItem.findUnique({
    where: { userId_entityType_entityId: { userId: session.sub, entityType: String(entityType), entityId: String(entityId) } },
  });
  if (existing) {
    await prisma.savedItem.delete({ where: { id: existing.id } });
    return Response.json({ active: false });
  }
  await prisma.savedItem.create({ data: { userId: session.sub, entityType: String(entityType), entityId: String(entityId) } });
  return Response.json({ active: true });
}