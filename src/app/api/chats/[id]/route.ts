import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const { id } = await params;
  const chat = await prisma.chat.findFirst({ where: { id, userId: session.sub }, include: { messages: { orderBy: { createdAt: "asc" }, select: { id: true, role: true, content: true, sources: true, createdAt: true } } } });
  if (!chat) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  return Response.json(chat);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  const { id } = await params;
  const chat = await prisma.chat.findFirst({ where: { id, userId: session.sub }, select: { id: true } });
  if (!chat) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  await prisma.chat.delete({ where: { id } });
  return Response.json({ ok: true });
}