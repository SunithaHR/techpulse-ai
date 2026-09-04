import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const chats = await prisma.chat.findMany({
    where: { userId: session.sub },
    select: { id: true, title: true, updatedAt: true, _count: { select: { messages: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return Response.json(chats);
}