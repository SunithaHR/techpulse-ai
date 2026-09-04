import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (id) {
    await prisma.notification.updateMany({ where: { id: String(id), userId: session.sub }, data: { readAt: new Date() } });
  } else {
    await prisma.notification.updateMany({ where: { userId: session.sub, readAt: null }, data: { readAt: new Date() } });
  }
  return Response.json({ ok: true });
}