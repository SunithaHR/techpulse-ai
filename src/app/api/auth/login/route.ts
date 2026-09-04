import { prisma } from "@/lib/db";
import { verifyPassword, signSession, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password, next } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user?.passwordHash || !(await verifyPassword(String(password), user.passwordHash))) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = await signSession(user);
  await setSessionCookie(token);
  return Response.json({ ok: true, next: next ?? "/dashboard" });
}