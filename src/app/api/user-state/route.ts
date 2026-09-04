import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reports whether the current user has saved/followed an entity (used by SaveButton/FollowButton). */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ active: false, authed: false }, { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind"); // save | follow
  const entityType = url.searchParams.get("type") ?? "";
  const entityId = url.searchParams.get("id") ?? "";
  if (!entityType || !entityId) return Response.json({ error: "type and id are required" }, { status: 400 });

  if (kind === "follow") {
    const row = await prisma.follow.findUnique({ where: { userId_entityType_entityId: { userId: session.sub, entityType, entityId } } });
    return Response.json({ active: Boolean(row) });
  }
  const row = await prisma.savedItem.findUnique({ where: { userId_entityType_entityId: { userId: session.sub, entityType, entityId } } });
  return Response.json({ active: Boolean(row) });
}