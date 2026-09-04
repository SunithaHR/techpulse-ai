import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { name, headline, bio, prefs } = body;
  await prisma.user.update({
    where: { id: session.sub },
    data: {
      ...(typeof name === "string" ? { name: name.trim() || null } : {}),
      ...(typeof headline === "string" ? { headline: headline.trim() || null } : {}),
      ...(typeof bio === "string" ? { bio: bio.trim() || null } : {}),
      ...(prefs && typeof prefs === "object" ? { prefs } : {}),
    },
  });
  return Response.json({ ok: true });
}