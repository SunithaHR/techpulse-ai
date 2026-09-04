import { prisma } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { email, password, name, next } = await req.json().catch(() => ({}));
  const cleanEmail = String(email ?? "").toLowerCase().trim();
  const cleanPassword = String(password ?? "");
  const cleanName = String(name ?? "").trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return Response.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (cleanPassword.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return Response.json({ error: "An account with this email already exists" }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: {
      email: cleanEmail,
      passwordHash: await hashPassword(cleanPassword),
      name: cleanName || null,
      prefs: { dashboardCategories: [], notifPrefs: { releases: true, security: true, aiModels: true, breakingChanges: true, majorAnnouncements: true, ecosystem: false }, digest: { enabled: false, scope: "DAILY" } },
    },
  });
  const token = await signSession(user);
  await setSessionCookie(token);
  return Response.json({ ok: true, next: next ?? "/dashboard" });
}