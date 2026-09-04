import { requireAdmin } from "@/lib/auth";
import { runSeed } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await requireAdmin();
  try {
    const counts = await runSeed({ wipe: true, quiet: true });
    return Response.json({ ok: true, counts });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}